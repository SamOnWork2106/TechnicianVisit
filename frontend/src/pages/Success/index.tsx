import { CheckCircle2, FileCheck, Mail, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";

interface SuccessState {
  reportType?: string;
  clientName?: string;
  managerEmail?: string;
  companyEmail?: string;
}

export default function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as SuccessState) || {};

  const reportType = state.reportType || "Field Technical Report";
  const clientName = state.clientName;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 max-w-lg w-full text-center border border-slate-200">
        <div className="flex justify-center mb-5">
          <img
            src="/company_logo.png"
            alt="IntelliGreen Technologies"
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 mx-auto flex items-center justify-center mb-4">
          <CheckCircle2 size={38} className="text-emerald-600" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          Report Submitted!
        </h1>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">
          <FileCheck size={14} />
          {reportType}
        </div>

        {clientName && (
          <p className="text-sm font-semibold text-slate-700 mt-3">
            Project / Client: <span className="text-teal-700">{clientName}</span>
          </p>
        )}

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mt-5 text-left text-xs text-slate-600 space-y-2">
          <div className="flex items-start gap-2">
            <Mail size={16} className="text-teal-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-700">Email Dispatched:</span>
              <p className="mt-0.5 text-xs text-slate-600">
                A formal HTML report with generated PDF attachment has been automatically emailed to:
              </p>
              <div className="mt-1.5 space-y-1 font-mono text-xs font-bold text-teal-800 bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                  <span>{state.managerEmail || "shikhar@intelligreentech.com"} (Manager)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                  <span>{state.companyEmail || "info@intelligreentech.com"} (Company Operations)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => navigate("/report")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Submit Another Report
          </Button>
        </div>
      </div>
    </div>
  );
}