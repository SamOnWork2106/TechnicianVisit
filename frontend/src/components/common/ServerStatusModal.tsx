import { useState, useEffect } from "react";
import { Server, Mail, Database, X, RefreshCw, CheckCircle2, AlertTriangle, Send } from "lucide-react";
import api from "../../services/api";

interface ServerStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ServerStatusModal({ isOpen, onClose }: ServerStatusModalProps) {
  const [smtpStatus, setSmtpStatus] = useState<any>(null);
  const [supaStatus, setSupaStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const [smtpRes, supaRes] = await Promise.allSettled([
        api.get("/smtp-status"),
        api.get("/supabase-status"),
      ]);

      if (smtpRes.status === "fulfilled") {
        setSmtpStatus(smtpRes.value.data);
      }
      if (supaRes.status === "fulfilled") {
        setSupaStatus(supaRes.value.data);
      }
    } catch (e) {
      console.error("Error fetching status:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTestResult(null);
      fetchStatus();
    }
  }, [isOpen]);

  const handleTestSmtp = async () => {
    try {
      setTestingSmtp(true);
      setTestResult(null);
      const res = await api.post("/test-smtp");
      setTestResult({
        success: true,
        message: res.data.message || "SMTP Connected and authenticated successfully!",
      });
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Failed to authenticate SMTP";
      setTestResult({
        success: false,
        message: msg,
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 p-4 px-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300">
              <Server size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">System & Server Status</h3>
              <p className="text-[11px] text-teal-200/80">Standalone Server Architecture (Port 8000)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              disabled={loading}
              title="Refresh Status"
              className="p-1 text-teal-200 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Standalone Server Architecture Badge */}
          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <span className="text-xs font-bold text-teal-950">Standalone Single Server</span>
                <p className="text-[11px] text-teal-800">React PWA + FastAPI running together on Port 8000</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              ACTIVE
            </span>
          </div>

          {/* Free SMTP Status Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Mail size={15} className="text-teal-700" />
                <span>Free SMTP Email Dispatcher</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  smtpStatus?.configured
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {smtpStatus?.configured ? "CONFIGURED" : "PENDING SETUP"}
              </span>
            </div>

            <div className="text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Sender Account:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {smtpStatus?.senderEmail || "Not set in backend/.env"}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Manager Recipient:</span>
                <span className="font-mono font-semibold text-teal-800">
                  {smtpStatus?.managerEmail || "vikash@intelligreentech.com"}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Company Recipient:</span>
                <span className="font-mono font-semibold text-teal-800">
                  {smtpStatus?.companyEmail || "info@intelligreentech.com"}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">App Password:</span>
                <span className="font-mono text-[11px] text-slate-700">
                  {smtpStatus?.passwordStatus || "Not set"}
                </span>
              </div>

              {smtpStatus?.passwordLength === 15 && (
                <div className="p-2 mt-1 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                  <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Your App Password has 15 characters. Google App Passwords are 16 letters (e.g. 4 chunks of 4 letters).
                    Check if 1 character was missed when pasting.
                  </span>
                </div>
              )}
            </div>

            {/* Test SMTP Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTestSmtp}
                disabled={testingSmtp}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {testingSmtp ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Connecting to Google SMTP...</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Test SMTP Connection Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`p-2.5 rounded-lg text-xs border ${
                  testResult.success
                    ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                    : "bg-rose-50 text-rose-900 border-rose-300"
                }`}
              >
                <div className="flex items-start gap-1.5">
                  {testResult.success ? (
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="break-all">{testResult.message}</span>
                </div>
              </div>
            )}
          </div>

          {/* Supabase Status Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Database size={15} className="text-teal-700" />
                <span>Supabase PostgreSQL Database</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  supaStatus?.connected
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-slate-100 text-slate-700 border-slate-300"
                }`}
              >
                {supaStatus?.connected ? "CONNECTED" : "NOT CONFIGURED"}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              {supaStatus?.message || "Storage ready for configuration in backend/.env"}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 px-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
