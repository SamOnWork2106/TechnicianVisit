import { useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import CommissioningReportForm from "../../components/commissioning/CommissioningReportForm";
import PPMReportForm from "../../components/ppm/PPMReportForm";
import FollowUpPanel from "../../components/followup/FollowUpPanel";
import NotificationPermission from "../../components/followup/NotificationPermission";
import { useAuth } from "../../context/AuthContext";
import { FileText, CheckSquare, Bell } from "lucide-react";

export default function ReportPage() {
  const { employee } = useAuth();
  const [activeTab, setActiveTab] = useState<"commissioning" | "ppm">("commissioning");
  const [showFollowUps, setShowFollowUps] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <PageHeader
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto py-6 px-4 sm:px-6 space-y-6">
        {/* Sub-bar with Quick Reminders Toggle & Mode Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 px-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Active Form:</span>
            {activeTab === "commissioning" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 font-semibold border border-teal-200">
                <FileText size={13} />
                IntelliGreen-IAQ Commissioning Report
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                <CheckSquare size={13} />
                PPM Maintenance Check List
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFollowUps(!showFollowUps)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border
                ${
                  showFollowUps
                    ? "bg-teal-700 text-white border-teal-800 shadow-xs"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }
              `}
            >
              <Bell size={13} />
              {showFollowUps ? "Hide Reminders" : "Maintenance Reminders"}
            </button>
          </div>
        </div>

        {/* Reminders & Notification Panel */}
        {showFollowUps && (
          <div className="space-y-4">
            <NotificationPermission />
            <FollowUpPanel employeeId={employee?.employeeId || ""} />
          </div>
        )}

        {/* Selected Form Component */}
        <div className="transition-all duration-200">
          {activeTab === "commissioning" ? (
            <CommissioningReportForm />
          ) : (
            <PPMReportForm />
          )}
        </div>
      </main>
    </div>
  );
}