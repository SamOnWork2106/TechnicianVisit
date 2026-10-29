import { useState } from "react";
import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import type { CommissioningForm } from "../../types/commissioning";
import { Zap, Plus, Trash2, Info, Edit3, X, Check, Activity } from "lucide-react";

interface Props {
  control: Control<CommissioningForm>;
  register: UseFormRegister<CommissioningForm>;
}

interface SampleData {
  sampleName: string;
  preStandard: string;
  postReading: string;
}

export default function IonResultsSection({ control, register }: Props) {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "ionSamples",
  });

  // Modal Window on Top State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [sampleData, setSampleData] = useState<SampleData>({
    sampleName: "",
    preStandard: "50-250",
    postReading: "",
  });

  const openAddModal = () => {
    setSampleData({
      sampleName: `Sample-${fields.length + 1}`,
      preStandard: "50-250",
      postReading: "",
    });
    setEditingIndex(null);
    setModalOpen(true);
  };

  const openEditModal = (index: number) => {
    const current = fields[index];
    setSampleData({
      sampleName: current.sampleName || `Sample-${index + 1}`,
      preStandard: current.preStandard || "50-250",
      postReading: current.postReading || "",
    });
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!sampleData.sampleName.trim()) {
      sampleData.sampleName = `Sample-${fields.length + 1}`;
    }
    if (editingIndex !== null) {
      update(editingIndex, {
        sampleName: sampleData.sampleName,
        preStandard: sampleData.preStandard || "50-250",
        postReading: sampleData.postReading,
      });
    } else {
      append({
        sampleName: sampleData.sampleName,
        preStandard: sampleData.preStandard || "50-250",
        postReading: sampleData.postReading,
      });
    }
    setModalOpen(false);
  };

  const setReadingPreset = (value: string) => {
    setSampleData((prev) => ({ ...prev, postReading: value }));
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
            <Zap className="text-teal-700" size={18} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Ion Concentration Test Results
            </h2>
            <p className="text-xs text-slate-500">
              Record pre-treatment baseline and post-commissioning negative ion density readings.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg shadow-2xs transition cursor-pointer active:scale-95"
        >
          <Plus size={15} />
          <span>Add Sample Point</span>
        </button>
      </div>

      {/* Hidden inputs to guarantee React Hook Form registers all fields for submission */}
      <div className="hidden">
        {fields.map((field, idx) => (
          <div key={field.id}>
            <input type="hidden" {...register(`ionSamples.${idx}.sampleName` as const)} />
            <input type="hidden" {...register(`ionSamples.${idx}.preStandard` as const)} />
            <input type="hidden" {...register(`ionSamples.${idx}.postReading` as const)} />
          </div>
        ))}
      </div>

      {/* MOBILE-FIRST VIEW: Responsive Cards (prevents cramped/hidden table text on phones) */}
      <div className="block md:hidden space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            onClick={() => openEditModal(index)}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-teal-50/40 hover:border-teal-300 transition cursor-pointer relative shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="font-bold text-sm text-slate-800">
                  {field.sampleName || `Sample-${index + 1}`}
                </span>
              </div>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => openEditModal(index)}
                  className="p-1.5 text-teal-700 hover:bg-teal-100 rounded-lg transition"
                  title="Edit in top window"
                >
                  <Edit3 size={15} />
                </button>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="Delete sample"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Pre (Standard)
                </span>
                <span className="font-mono text-slate-700 font-medium">
                  {field.preStandard || "50-250"} ions/cm³
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Post (Active Density)
                </span>
                {field.postReading ? (
                  <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-800 text-xs">
                    {field.postReading} ions/cm³
                  </span>
                ) : (
                  <span className="text-rose-500 italic font-medium flex items-center gap-1">
                    <span>Tap to enter reading</span>
                    <Edit3 size={12} />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW: Clean Table on larger screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-teal-800 text-white text-xs uppercase tracking-wider">
              <th className="py-2.5 px-4 rounded-tl-lg font-semibold w-1/3">
                Sample Point / Zone
              </th>
              <th className="py-2.5 px-4 font-semibold w-1/4">
                Pre (Ions/cm³) (Standard)
              </th>
              <th className="py-2.5 px-4 font-semibold w-1/3">
                Post (Ions/cm³) (Active Density)
              </th>
              <th className="py-2.5 px-3 rounded-tr-lg text-center w-24">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white border border-slate-200 border-t-0">
            {fields.map((field, index) => (
              <tr key={field.id} className="hover:bg-slate-50 transition">
                <td className="p-3 px-4 font-medium text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span>{field.sampleName || `Sample-${index + 1}`}</span>
                  </div>
                </td>

                <td className="p-3 px-4 text-slate-600 font-mono">
                  {field.preStandard || "50-250"}
                </td>

                <td className="p-3 px-4">
                  {field.postReading ? (
                    <span className="inline-block px-2.5 py-1 rounded font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
                      {field.postReading} ions/cm³
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-xs">Not recorded</span>
                  )}
                </td>

                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(index)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold border border-teal-200 transition cursor-pointer"
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                        title="Remove sample row"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* OEM Benchmark Note */}
      <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2 text-xs text-slate-600">
        <Info size={16} className="text-teal-700 shrink-0 mt-0.5" />
        <p className="italic">
          <strong>OEM Scientific Benchmark:</strong> Various studies and tests done by OEMs globally suggest that ion concentration above <strong>1,500 ions/cm³</strong> is capable to destroy the hemagglutinin surface (Viral Protein, that triggers the infection) and deactivate viruses including COVID-19.
        </p>
      </div>

      {/* WINDOW ON TOP (MODAL DIALOG FOR MOBILE COLUMN FILLING) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative text-left">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4 text-teal-800">
              <Activity size={20} className="text-teal-700" />
              <h3 className="font-bold text-base sm:text-lg">
                {editingIndex !== null ? `Edit Sample Point #${editingIndex + 1}` : "Add Ion Test Sample Point"}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sample Point / Zone Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={sampleData.sampleName}
                  onChange={(e) =>
                    setSampleData((prev) => ({ ...prev, sampleName: e.target.value }))
                  }
                  placeholder="e.g. Sample-1 (1st Floor Meeting Room)"
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pre (Ions/cm³) Baseline Standard
                </label>
                <input
                  type="text"
                  value={sampleData.preStandard}
                  onChange={(e) =>
                    setSampleData((prev) => ({ ...prev, preStandard: e.target.value }))
                  }
                  placeholder="50-250"
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Post (Ions/cm³) Active Negative Density <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={sampleData.postReading}
                  onChange={(e) =>
                    setSampleData((prev) => ({ ...prev, postReading: e.target.value }))
                  }
                  placeholder="e.g. -8650 or -18000"
                  className="w-full border border-teal-300 bg-teal-50/40 rounded-xl p-3 text-base font-bold text-teal-900 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none font-mono"
                />

                {/* Quick Touch Badges for Phone User */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-500 font-semibold mr-1">Quick Select:</span>
                  {["-1800", "-4500", "-8650", "-12500", "-18000"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setReadingPreset(preset)}
                      className="px-2.5 py-1 text-xs rounded-lg font-mono font-semibold bg-slate-100 hover:bg-teal-100 hover:text-teal-800 text-slate-700 border border-slate-200 transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Values exceeding -1,500 ions/cm³ satisfy the pathogen deactivation requirement.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-md transition cursor-pointer active:scale-95"
              >
                <Check size={14} />
                <span>Save Sample Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
