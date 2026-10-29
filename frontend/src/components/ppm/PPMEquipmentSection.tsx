import type { UseFormRegister } from "react-hook-form";
import type { PPMForm } from "../../types/ppm";
import { Sliders, Cpu } from "lucide-react";

interface Props {
  register: UseFormRegister<PPMForm>;
}

export default function PPMEquipmentSection({ register }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Sliders className="text-teal-700" size={20} />
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Equipment Details
          </h2>
          <p className="text-xs text-slate-500">
            Specify the Central Air Purification units and IAQ Monitor equipment being inspected.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <Cpu size={14} className="text-teal-600" />
            PA Details (Plasma Air Units / Models / Nos) <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="e.g. PA 604 - Central Plasma Air Purification Units - 101 Nos"
            {...register("equipment.paDetails", { required: true })}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <Cpu size={14} className="text-teal-600" />
            IAQ Monitor Details (Sensors / Types / Nos) <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="e.g. IAQM-6 Indoor Air Quality Monitoring Sensors - 6 Nos"
            {...register("equipment.iaqMonitorDetails", { required: true })}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
