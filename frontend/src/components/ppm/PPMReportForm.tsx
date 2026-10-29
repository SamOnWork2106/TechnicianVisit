import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Download, Send, Sparkles, RotateCcw, CheckSquare, CheckCircle2 } from "lucide-react";

import type { PPMForm } from "../../types/ppm";
import {
  INITIAL_PPM_DATA,
  SAMPLE_FILLED_PPM_DATA,
} from "../../config/technicianData";
import {
  submitPPMReport,
  downloadPPMPDF,
} from "../../services/ppmService";
import { useAuth } from "../../context/AuthContext";

import PPMEquipmentSection from "./PPMEquipmentSection";
import PPMProjectSection from "./PPMProjectSection";
import PPMChecklistSection from "./PPMChecklistSection";
import PPMSignaturesSection from "./PPMSignaturesSection";

export default function PPMReportForm() {
  const navigate = useNavigate();
  const { employee } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { isDirty },
  } = useForm<PPMForm>({
    defaultValues: INITIAL_PPM_DATA,
  });

  // If technician logged in, auto-fill technician name
  useEffect(() => {
    if (employee?.name) {
      setValue("signatures.technicianName", employee.name);
    }
  }, [employee, setValue]);

  // Prevent unload if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || submitting) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, submitting]);

  const handleLoadSample = () => {
    reset(SAMPLE_FILLED_PPM_DATA);
    toast.success("Loaded sample PPM maintenance data.");
  };

  const handleResetForm = () => {
    reset(INITIAL_PPM_DATA);
    if (employee?.name) {
      setValue("signatures.technicianName", employee.name);
    }
    toast("PPM Checklist reset to initial state.");
  };

  const handleDownloadPDF = async () => {
    const values = getValues();
    if (!values.project.client) {
      toast.error("Please enter a Client Name before downloading PDF.");
      return;
    }

    try {
      setDownloading(true);
      await downloadPPMPDF(values);
      toast.success("PPM Check List PDF downloaded!");
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("Failed to generate PDF. Make sure backend is running.");
    } finally {
      setDownloading(false);
    }
  };

  const onSubmit = async (data: PPMForm) => {
    try {
      setSubmitting(true);
      const res = await submitPPMReport(data);
      toast.success(res.message || "PPM Check List submitted successfully!");

      navigate("/success", {
        replace: true,
        state: {
          reportType: "Periodic Preventive Maintenance (PPM) Check List",
          clientName: data.project.client,
          managerEmail: "shikhar@intelligreentech.com",
          companyEmail: "info@intelligreentech.com",
        },
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit PPM Check List report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
              <CheckSquare size={18} />
            </span>
            <h2 className="text-base sm:text-lg font-bold">
              Periodic Preventive Maintenance (PPM) Check List
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            IntelliGreen Central Air Purification System maintenance inspection. Perform 7-point evaluation, document actions taken, record client feedback, and submit report.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-600/40 hover:bg-teal-600/60 border border-teal-400/40 rounded-lg transition cursor-pointer"
          >
            <Sparkles size={13} />
            Load Sample Data
          </button>

          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg transition cursor-pointer"
          >
            <RotateCcw size={13} />
            Reset Form
          </button>
        </div>
      </div>

      <fieldset disabled={submitting} className="space-y-6">
        <PPMEquipmentSection register={register} />
        <PPMProjectSection register={register} />
        <PPMChecklistSection control={control} register={register} />
        <PPMSignaturesSection register={register} />

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
