import type { UseFormRegister } from "react-hook-form";
import type { CommissioningForm } from "../../types/commissioning";
import { Cpu, Calendar } from "lucide-react";

interface Props {
  register: UseFormRegister<CommissioningForm>;
}

export default function CommissioningGeneralSection({ register }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Cpu className="text-teal-700" size={20} />
        <h2 className="text-lg font-bold text-slate-800">
          Solution & Commissioning Details
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Description / Model Installed <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Model Installed- PA 604-101 Nos, & IAQM-6 Nos."
            {...register("description", { required: true })}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <Calendar size={14} className="text-teal-600" />
            Commissioning Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            {...register("commissioningDate", { required: true })}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Submitted By Entity
          </label>
          <input
            type="text"
            {...register("submittedBy")}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
