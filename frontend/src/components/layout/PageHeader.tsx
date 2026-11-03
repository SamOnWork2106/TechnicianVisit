import { useState } from "react";
import { LogOut, User, FileSpreadsheet, CheckSquare, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import InstallPwaButton from "../common/InstallPwaButton";
import TechnicianSideDrawer from "./TechnicianSideDrawer";

interface Props {
  activeTab?: "commissioning" | "ppm";
  onSelectTab?: (tab: "commissioning" | "ppm") => void;
}

export default function PageHeader({
  activeTab = "commissioning",
  onSelectTab,
}: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { employee, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        {/* Top Branding & Profile Bar */}
        <div className="py-2 sm:py-2.5 flex items-center justify-between border-b border-slate-100 gap-2 sm:gap-4">
          {/* Logo & Company Branding with prominent horizontal sizing */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 py-0.5">
            <img
              src="/company_logo.png"
              alt="IntelliGreen Technologies"
              className="h-10 sm:h-12 md:h-14 w-auto max-w-[210px] xs:max-w-[240px] sm:max-w-[280px] object-contain shrink-0 drop-shadow-2xs"
            />
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              Technician
            </span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop Technician Profile Chip */}
            {employee ? (
              <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
                <User size={14} className="text-emerald-700" />
                <span className="font-semibold">{employee.name}</span>
                <span className="text-slate-300">|</span>
                <span className="font-mono text-[11px] text-slate-500">{employee.employeeId}</span>
              </div>
            ) : null}

            {/* Desktop Install App Button */}
            <div className="hidden sm:block">
              <InstallPwaButton />
            </div>

            {/* Desktop Direct Sign Out */}
            <button
              onClick={handleLogout}
              className="hidden md:flex p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>

            {/* 3-Line Menu Icon (Hamburger Button) for Phone & Quick Access */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1.5"
              aria-label="Open Technician Menu"
              title="Menu & Settings"
            >
              <Menu size={20} className="text-slate-800" />
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        {onSelectTab && (
          <div className="flex items-center gap-2 sm:gap-6 pt-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => onSelectTab("commissioning")}
              className={`
                flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap
                ${
                  activeTab === "commissioning"
                    ? "border-emerald-600 text-emerald-900 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }
              `}
            >
              <FileSpreadsheet size={16} />
              <span>Commissioning Report</span>
              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                IAQ Solution
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("ppm")}
              className={`
                flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap
                ${
                  activeTab === "ppm"
                    ? "border-emerald-600 text-emerald-900 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }
              `}
            >
              <CheckSquare size={16} />
              <span>PPM Check List</span>
              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                Preventive Maintenance
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Technician Mobile Side Panel Drawer */}
      <TechnicianSideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onLogout={handleLogout}
      />
    </header>
  );
}