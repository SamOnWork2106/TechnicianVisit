import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Download, Send, Sparkles, RotateCcw, FileText, CheckCircle2 } from "lucide-react";

import type { CommissioningForm } from "../../types/commissioning";
import { COMMISSIONING_EXAMPLE_DATA } from "../../config/technicianData";
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

  // Initialize with example data as requested
  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { isDirty },
  } = useForm<CommissioningForm>({
    defaultValues: COMMISSIONING_EXAMPLE_DATA,
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
    reset(COMMISSIONING_EXAMPLE_DATA);
    toast.success("Loaded TCI Commissioning example data.");
  };

  const handleClearForm = () => {
    reset({
      description: "",
      commissioningDate: new Date().toISOString().split("T")[0],
      installer: {
        installerName: "IntelliGreen Technologies Pvt. Ltd.",
        contactPerson: employee?.name || "",
        contactNo: "",
        companyAddress: "Unit No. COS/3L/Office/17, M3M Cosmopolitan, Sector 66, Gurgaon, Haryana 122002",
        telNo: "+91 124 4256862",
        email: "info@intelligreentech.com",
        managerEmail: "shikhar@intelligreentech.com",
      },
      client: {
        clientName: "",
        project: "",
        clientRepresentative: "",
        location: "",
        contactNo: "",
        telNo: "NA",
        email: "",
        clientAddress: "",
      },
      ionSamples: [
        { sampleName: "Sample-1", preStandard: "50-250", postReading: "" },
      ],
      sensorDescription: "",
      sensors: [
        { location: "Floor 1", macId: "" },
      ],
      bmsNotes: "",
      submittedBy: "IntelliGreen Technologies Pvt Ltd",
      aiSummary: "",
    });
    toast("Form cleared for fresh entry.");
  };

  const handleDownloadPDF = async () => {
    const values = getValues();
    if (!values.client.project) {
      toast.error("Please enter a Project Name before downloading PDF.");
      return;
    }

    try {
      setDownloading(true);
      await downloadCommissioningPDF(values);
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
      const res = await submitCommissioningReport(data);
      toast.success(res.message || "Commissioning Report submitted successfully!");

      navigate("/success", {
        replace: true,
        state: {
          reportType: "IntelliGreen-IAQ Solution Commissioning Report",
          clientName: `${data.client.project} (${data.client.clientName})`,
          managerEmail: "shikhar@intelligreentech.com",
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
            Pre-loaded with sample commissioning records from project TCI. Review readings, inspect IAQM sensor MAC addresses, and submit report.
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
        <IonResultsSection control={control} register={register} />
        <SensorsSection control={control} register={register} />

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
