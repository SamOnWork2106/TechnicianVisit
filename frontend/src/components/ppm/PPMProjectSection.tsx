import type { UseFormRegister } from "react-hook-form";
import type { PPMForm } from "../../types/ppm";
import { Building, MapPin, Calendar, Mail } from "lucide-react";

interface Props {
  register: UseFormRegister<PPMForm>;
}

export default function PPMProjectSection({ register }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Building className="text-teal-700" size={20} />
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Project & PPM Maintenance Schedule
          </h2>
          <p className="text-xs text-slate-500">
            Record client identity, installation site, and service cycle dates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <Building size={14} className="text-teal-600" />
            Client Name / Project <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Studiokon Ventures Private Limited / TCI"
            {...register("project.client", { required: true })}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <MapPin size={14} className="text-teal-600" />
            Site Location / Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Plot No. 57, Urban Estate, Gurgaon Sector-18"
            {...register("project.location", { required: true })}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <Calendar size={14} className="text-teal-600" />
            Last PPM Date / Remarks
          </label>
          <input
            type="text"
            placeholder="e.g. 28.05.2025 or First Service"
            {...register("ppmInfo.lastPpm")}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <Calendar size={14} className="text-teal-600" />
            Current PPM Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            {...register("ppmInfo.currentPpm", { required: true })}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <Mail size={14} className="text-teal-600" />
            Client Representative Email (Optional — automatic copy will be emailed to client)
          </label>
          <input
            type="email"
            placeholder="e.g. client.representative@skvindia.com"
            {...register("project.clientEmail")}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
