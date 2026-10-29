import type { UseFormRegister } from "react-hook-form";
import type { CommissioningForm } from "../../types/commissioning";
import { Wrench, Phone, MapPin, Building2, Mail } from "lucide-react";

interface Props {
  register: UseFormRegister<CommissioningForm>;
}

export default function InstallerSection({ register }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Wrench className="text-teal-700" size={20} />
        <h2 className="text-lg font-bold text-slate-800">
          Installer Information (IntelliGreen Technologies)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 size={14} className="text-teal-600" />
              Installer Company Name
            </span>
            <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold border border-teal-200">
              Fixed
            </span>
          </label>
          <input
            type="text"
            readOnly
            {...register("installer.installerName", { required: true })}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-100 text-slate-700 font-medium cursor-not-allowed outline-none select-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <Wrench size={14} className="text-teal-600" />
            Contact Person (Technician) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Mr. Lokendra Shekhwat"
            {...register("installer.contactPerson", { required: true })}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <Phone size={14} className="text-teal-600" />
            Technician Contact No. <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 8005575735"
            {...register("installer.contactNo", { required: true })}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Phone size={14} className="text-teal-600" />
              Company Tel. No.
            </span>
            <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold border border-teal-200">
              Fixed
            </span>
          </label>
          <input
            type="text"
            readOnly
            {...register("installer.telNo")}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-100 text-slate-700 font-medium cursor-not-allowed outline-none select-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Mail size={14} className="text-teal-600" />
              Company Official Email
            </span>
            <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold border border-teal-200">
              Fixed
            </span>
          </label>
          <input
            type="email"
            readOnly
            {...register("installer.email")}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-100 text-slate-700 font-medium cursor-not-allowed outline-none select-none"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-teal-600" />
              Company Address
            </span>
            <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold border border-teal-200">
              Fixed
            </span>
          </label>
          <input
            type="text"
            readOnly
            {...register("installer.companyAddress")}
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-100 text-slate-700 font-medium cursor-not-allowed outline-none select-none"
          />
        </div>
      </div>
    </div>
  );
}
