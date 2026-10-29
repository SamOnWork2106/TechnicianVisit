import { useState } from "react";
import {
  X,
  LogOut,
  FileSpreadsheet,
  CheckSquare,
  Smartphone,
  Mail,
  HardDrive,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import InstallPwaButton from "../common/InstallPwaButton";

interface TechnicianSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: "commissioning" | "ppm";
  onSelectTab?: (tab: "commissioning" | "ppm") => void;
  onLogout: () => void;
}

export default function TechnicianSideDrawer({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onLogout,
}: TechnicianSideDrawerProps) {
  const { employee } = useAuth();
  const [showDispatchInfo, setShowDispatchInfo] = useState(false);

  if (!isOpen) return null;

  const handleTabSwitch = (tab: "commissioning" | "ppm") => {
    if (onSelectTab) {
      onSelectTab(tab);
    }
    onClose();
  };

  const getInitials = (name?: string) => {
    if (!name) return "FT";
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300 border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <img
              src="/company_logo.png"
              alt="IntelliGreen Technologies"
              className="h-10 sm:h-11 w-auto max-w-[210px] object-contain drop-shadow-2xs"
            />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Technician Profile Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-slate-50 border border-emerald-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-black text-base flex items-center justify-center shadow-xs shrink-0 ring-2 ring-emerald-200">
                {getInitials(employee?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-slate-800 truncate">
                    {employee?.name || "Field Technician"}
                  </h3>
                </div>
                <p className="text-xs font-mono text-emerald-800 font-semibold">
                  ID: {employee?.employeeId || "TECH-01"}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                    Authorized Field Service
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Navigation Section */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Field Reports
            </p>

            <button
              type="button"
              onClick={() => handleTabSwitch("commissioning")}
              className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition cursor-pointer border ${
                activeTab === "commissioning"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    activeTab === "commissioning"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <FileSpreadsheet size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold">Commissioning Report</div>
                  <div className="text-[11px] text-slate-500">IAQ Solution Installation</div>
                </div>
              </div>
              <ChevronRight
                size={16}
                className={activeTab === "commissioning" ? "text-emerald-700" : "text-slate-300"}
              />
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch("ppm")}
              className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition cursor-pointer border ${
                activeTab === "ppm"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    activeTab === "ppm"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <CheckSquare size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold">PPM Check List</div>
                  <div className="text-[11px] text-slate-500">Periodic Preventive Maintenance</div>
                </div>
              </div>
              <ChevronRight
                size={16}
                className={activeTab === "ppm" ? "text-emerald-700" : "text-slate-300"}
              />
            </button>
          </div>

          {/* Quick Settings & App Information */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Application Settings
            </p>

            {/* Install Application */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-100/70 text-teal-800">
                  <Smartphone size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Install to Phone</div>
                  <div className="text-[10px] text-slate-500">PWA standalone mobile app</div>
                </div>
              </div>
              <InstallPwaButton />
            </div>

            {/* Email Dispatch Information */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <button
                type="button"
                onClick={() => setShowDispatchInfo(!showDispatchInfo)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-800">
                    <Mail size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Automatic Email Dispatch</div>
                    <div className="text-[10px] text-slate-500">Dispatches PDF to management</div>
                  </div>
                </div>
                <ChevronRight
                  size={15}
                  className={`text-slate-400 transition-transform ${
                    showDispatchInfo ? "rotate-90" : ""
                  }`}
                />
              </button>

              {showDispatchInfo && (
                <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1.5 text-slate-600 bg-white p-2.5 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Manager:</span>
                    <span className="font-mono font-semibold text-emerald-800">
                      shikhar@intelligreentech.com
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Operations:</span>
                    <span className="font-mono font-semibold text-emerald-800">
                      info@intelligreentech.com
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1">
                    Delivered automatically upon clicking "Submit & Email Report".
                  </div>
                </div>
              )}
            </div>

            {/* Offline Auto-Save Status */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-100/70 text-blue-800">
                  <HardDrive size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Offline Safety</div>
                  <div className="text-[10px] text-slate-500">Auto-saves forms locally</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                ENABLED
              </span>
            </div>
          </div>
        </div>

        {/* Drawer Footer with Prominent Logout Button */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-300/80 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-98"
          >
            <LogOut size={16} />
            <span>Log Out of Portal</span>
          </button>

          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-medium">
              IntelliGreen Technologies • Field Service v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
