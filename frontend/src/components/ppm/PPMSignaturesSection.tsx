import type { UseFormRegister } from "react-hook-form";
import type { PPMForm } from "../../types/ppm";
import { PenTool, MessageSquare, Award } from "lucide-react";

interface Props {
  register: UseFormRegister<PPMForm>;
}

export default function PPMSignaturesSection({ register }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <PenTool className="text-teal-700" size={20} />
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Signatures & Client Feedback
          </h2>
          <p className="text-xs text-slate-500">
            Field service sign-off by IntelliGreen technician and on-site client representative.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Technician Column */}
        <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/20 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-teal-100">
            <Award size={16} className="text-teal-700" />
            <h3 className="text-sm font-bold text-teal-900">
              IntelliGreen Technologies Pvt Ltd
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Technician's Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Field Technician Name"
              {...register("signatures.technicianName", { required: true })}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-600 outline-none"
            />
          </div>

          <div className="p-3 bg-white rounded-lg border border-teal-100 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Technician Signature:
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              ✓ Certified Digitally
            </span>
          </div>
        </div>

        {/* Client Column */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <PenTool size={16} className="text-slate-700" />
            <h3 className="text-sm font-bold text-slate-800">
              Client's Representative
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Representative Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Mr. Barun"
              {...register("signatures.clientRepName", { required: true })}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-600 outline-none"
            />
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Site Stamp & Sign Status:
            </span>
            <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
              :Stamp & Sign Verified
            </span>
          </div>
        </div>
      </div>

      {/* Client Feedback */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
          <MessageSquare size={14} className="text-teal-600" />
          Client's Remark / Feedback
        </label>
        <textarea
          rows={3}
          placeholder="Client comments regarding system operation, air freshness, maintenance quality, or follow-up requests..."
          {...register("signatures.clientFeedback")}
          className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-600 outline-none leading-relaxed"
        />
      </div>
    </div>
  );
}
