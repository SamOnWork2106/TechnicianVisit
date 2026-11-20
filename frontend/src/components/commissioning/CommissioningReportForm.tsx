import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Download, Send, Sparkles, RotateCcw, FileText, CheckCircle2, Plus, Zap, Network } from "lucide-react";

import type { CommissioningForm } from "../../types/commissioning";
import { EMPTY_COMMISSIONING_DATA, COMMISSIONING_EXAMPLE_DATA } from "../../config/technicianData";
import {
  submitCommissioningReport,
  downloadCommissioningPDF,
} from "../../services/commissioningService";
import { useAuth } from "../../context/AuthContext";

import CommissioningGeneralSection from "./CommissioningGeneralSection";
import InstallerSection from "./InstallerSection";
import ClientSection from "./ClientSection";
import IonResultsSection from "./IonResultsSection";
import SensorsSection from "./SensorsSection";

export default function CommissioningReportForm() {
  const navigate = useNavigate();
  const { employee } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [includeIonSection, setIncludeIonSection] = useState(true);
  const [includeSensorsSection, setIncludeSensorsSection] = useState(true);

  // Initialize with clean empty form by default (no prefilled sample data)
  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { isDirty },
  } = useForm<CommissioningForm>({
    defaultValues: EMPTY_COMMISSIONING_DATA,
  });

  // If technician logged in, update contact person
  useEffect(() => {
    if (employee?.name) {
      setValue("installer.contactPerson", employee.name);
    }
  }, [employee, setValue]);

  // Prevent accidental navigation when form is dirty
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || submitting) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, submitting]);

  const handleLoadExample = () => {
    setIncludeIonSection(true);
    setIncludeSensorsSection(true);
    reset(COMMISSIONING_EXAMPLE_DATA);
    if (employee?.name) {
      setValue("installer.contactPerson", employee.name);
    }
    toast.success("Loaded TCI Commissioning example data.");
  };

  const handleClearForm = () => {
    setIncludeIonSection(true);
    setIncludeSensorsSection(true);
    reset(EMPTY_COMMISSIONING_DATA);
    if (employee?.name) {
      setValue("installer.contactPerson", employee.name);
    }
    toast("Form cleared for fresh entry.");
  };

  const handleDeleteIonSection = () => {
    setValue("ionSamples", []);
    setIncludeIonSection(false);
    toast("Ion Concentration Test Results section removed.");
  };

  const handleDeleteSensorsSection = () => {
    setValue("sensors", []);
    setValue("sensorDescription", "");
    setIncludeSensorsSection(false);
    toast("IAQM Sensors & BMS Integration section removed.");
  };

  const handleDownloadPDF = async () => {
    const rawValues = getValues();
    if (!rawValues.client?.project) {
      toast.error("Please enter a Project Name before downloading PDF.");
      return;
    }

    // Ensure deleted sections are strictly stripped from the payload
    const sanitizedPayload: CommissioningForm = {
      ...rawValues,
      ionSamples: includeIonSection ? (rawValues.ionSamples || []) : [],
      sensors: includeSensorsSection ? (rawValues.sensors || []) : [],
      sensorDescription: includeSensorsSection ? (rawValues.sensorDescription || "") : "",
    };

    try {
      setDownloading(true);
      await downloadCommissioningPDF(sanitizedPayload);
      toast.success("Commissioning PDF generated & downloaded!");
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("Failed to generate PDF. Make sure backend is running.");
    } finally {
      setDownloading(false);
    }
  };

  const onSubmit = async (data: CommissioningForm) => {
    try {
      setSubmitting(true);
      // Ensure deleted sections are strictly stripped from the payload
      const sanitizedPayload: CommissioningForm = {
        ...data,
        ionSamples: includeIonSection ? (data.ionSamples || []) : [],
        sensors: includeSensorsSection ? (data.sensors || []) : [],
        sensorDescription: includeSensorsSection ? (data.sensorDescription || "") : "",
      };

      const res = await submitCommissioningReport(sanitizedPayload);
      toast.success(res.message || "Commissioning Report submitted successfully!");

      navigate("/success", {
        replace: true,
        state: {
          reportType: "IntelliGreen-IAQ Solution Commissioning Report",
          clientName: `${data.client.project} (${data.client.clientName})`,
          managerEmail: "vikash@intelligreentech.com",
          companyEmail: "info@intelligreentech.com",
        },
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit Commissioning report. Please verify connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Top Helper Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
              <FileText size={18} />
            </span>
            <h2 className="text-base sm:text-lg font-bold">
              Commissioning Report — IntelliGreen-IAQ Solution
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Fill in the commissioning records for the IAQ installation. Record ion readings, inspect sensor MAC addresses, and submit report. (Click &apos;Load Example Data&apos; if needed).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadExample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-600/40 hover:bg-teal-600/60 border border-teal-400/40 rounded-lg transition cursor-pointer"
          >
            <Sparkles size={13} />
            Load Example Data
          </button>

          <button
            type="button"
            onClick={handleClearForm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg transition cursor-pointer"
          >
            <RotateCcw size={13} />
            Clear Form
          </button>
        </div>
      </div>

      <fieldset disabled={submitting} className="space-y-6">
        <CommissioningGeneralSection register={register} />
        <InstallerSection register={register} />
        <ClientSection register={register} />

        {/* Ion Results Section with Delete Section capability */}
        {!includeIonSection ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Ion Concentration Test Results Section Excluded
                </h3>
                <p className="text-xs text-slate-500">
                  This section has been deleted and will not be included in the report.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIncludeIonSection(true);
                toast.success("Ion Concentration Test Results section restored.");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg shadow-2xs transition cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>Add Ion Results Section</span>
            </button>
          </div>
        ) : (
          <IonResultsSection
            control={control}
            register={register}
            onDeleteSection={handleDeleteIonSection}
          />
        )}

        {/* Sensors & BMS Section with Delete Section capability */}
        {!includeSensorsSection ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                <Network size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  IAQM Sensors & BMS Integration Section Excluded
                </h3>
                <p className="text-xs text-slate-500">
                  This section has been deleted and will not be included in the report.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIncludeSensorsSection(true);
                toast.success("IAQM Sensors & BMS Integration section restored.");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg shadow-2xs transition cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>Add Sensors Section</span>
            </button>
          </div>
        ) : (
          <SensorsSection
            control={control}
            register={register}
            onDeleteSection={handleDeleteSensorsSection}
          />
        )}

        {/* Action Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20">
          <div className="text-xs text-slate-600 text-center sm:text-left flex items-center gap-2">
            <CheckCircle2 size={16} className="text-teal-700 shrink-0 hidden sm:inline" />
            <span>Official report will be dispatched to company operations & management.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloading || submitting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download size={16} />
              {downloading ? "Preparing PDF..." : "Download PDF"}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <Send size={16} />
              {submitting ? "Submitting..." : "Submit & Email Report"}
            </button>
          </div>
        </div>
      </fieldset>
    </form>
  );
}
