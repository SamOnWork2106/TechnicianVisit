import { useState } from "react";
import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import type { PPMForm } from "../../types/ppm";
import { CheckSquare, Plus, Trash2, RotateCcw, Edit3, X, Check, Wrench, Zap, Wind } from "lucide-react";
import {
  PPM_CONDITION_PRESETS,
  DEFAULT_PPM_CHECKLIST_ITEMS,
  EAC_CHECKLIST_OPTIONS,
  CTFA_CHECKLIST_OPTIONS,
} from "../../config/technicianData";

interface Props {
  control: Control<PPMForm>;
  register: UseFormRegister<PPMForm>;
}

interface ItemData {
  sn: number;
  checkList: string;
  condition: string;
  actionTaken: string;
}

export default function PPMChecklistSection({ control, register }: Props) {
  const { fields, append, remove, update, replace } = useFieldArray({
    control,
    name: "checkList",
  });

  // Modal Window on Top State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [itemData, setItemData] = useState<ItemData>({
    sn: 1,
    checkList: "",
    condition: "Satisfactory / OK",
    actionTaken: "",
  });

  const isOptionAdded = (optionText: string) => {
    return fields.some(
      (f) => f.checkList.trim().toLowerCase() === optionText.trim().toLowerCase()
    );
  };

  const handleToggleAddOption = (optionText: string) => {
    if (!isOptionAdded(optionText)) {
      append({
        sn: fields.length + 1,
        checkList: optionText,
        condition: "Satisfactory / OK",
        actionTaken: "",
      });
    }
  };

  const handleAddAllEAC = () => {
    EAC_CHECKLIST_OPTIONS.forEach((opt) => {
      if (!isOptionAdded(opt)) {
        append({
          sn: fields.length + 1,
          checkList: opt,
          condition: "Satisfactory / OK",
          actionTaken: "",
        });
      }
    });
  };

  const handleAddAllCTFA = () => {
    CTFA_CHECKLIST_OPTIONS.forEach((opt) => {
      if (!isOptionAdded(opt)) {
        append({
          sn: fields.length + 1,
          checkList: opt,
          condition: "Satisfactory / OK",
          actionTaken: "",
        });
      }
    });
  };

  const openAddModal = () => {
    setItemData({
      sn: fields.length + 1,
      checkList: "",
      condition: "Satisfactory / OK",
      actionTaken: "",
    });
    setEditingIndex(null);
    setModalOpen(true);
  };

  const openEditModal = (index: number) => {
    const current = fields[index];
    setItemData({
      sn: current.sn || index + 1,
      checkList: current.checkList || "",
      condition: current.condition || "Satisfactory / OK",
      actionTaken: current.actionTaken || "",
    });
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleSaveModal = () => {
    if (editingIndex !== null) {
      update(editingIndex, {
        sn: itemData.sn,
        checkList: itemData.checkList,
        condition: itemData.condition || "Satisfactory / OK",
        actionTaken: itemData.actionTaken,
      });
    } else {
      append({
        sn: fields.length + 1,
        checkList: itemData.checkList || `Custom Inspection Item ${fields.length + 1}`,
        condition: itemData.condition || "Satisfactory / OK",
        actionTaken: itemData.actionTaken,
      });
    }
    setModalOpen(false);
  };

  const handleResetDefault = () => {
    replace(DEFAULT_PPM_CHECKLIST_ITEMS);
  };

  const getConditionBadgeStyle = (cond: string) => {
    const lower = (cond || "").toLowerCase();
    if (lower.includes("ok") || lower.includes("satisfactory") || lower.includes("good")) {
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    }
    if (lower.includes("cleaned") || lower.includes("serviced") || lower.includes("replaced")) {
      return "bg-blue-50 text-blue-800 border-blue-200";
    }
    if (lower.includes("attention") || lower.includes("defect") || lower.includes("fault") || lower.includes("bad")) {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
            <CheckSquare className="text-teal-700" size={18} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              {fields.length === 7
                ? "7-Point Preventive Maintenance Inspection Checklist"
                : `Preventive Maintenance Inspection Checklist (${fields.length} Points)`}
            </h2>
            <p className="text-xs text-slate-500">
              Evaluate each maintenance item, specify observed condition, and describe action taken.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            title="Reset to 7 standard inspection items"
          >
            <RotateCcw size={13} />
            <span>Reset 7 Points</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg shadow-2xs transition cursor-pointer active:scale-95"
          >
            <Plus size={14} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Optional Protocol Add-ons: EAC and CTFA Checklists */}
      <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Inspection Checklist Options</span>
              <span className="text-[11px] font-normal text-slate-500 lowercase">
                (tap any option to add onto checklist)
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Add specialized EAC or CTFA equipment inspection points to this maintenance report if required:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* EAC Add-ons Group */}
          <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-100">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                <Zap size={14} className="text-amber-600" />
                <span>EAC (Electronic Air Cleaner) Options</span>
              </div>
              <button
                type="button"
                onClick={handleAddAllEAC}
                className="text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-300 transition cursor-pointer active:scale-95"
              >
                + Add All EAC
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {EAC_CHECKLIST_OPTIONS.map((opt) => {
                const added = isOptionAdded(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleToggleAddOption(opt)}
                    className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg border text-left transition cursor-pointer ${
                      added
                        ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold"
                        : "bg-slate-50/70 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border-slate-200 hover:border-amber-300 active:scale-98"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {added ? (
                        <Check size={13} className="text-emerald-600 shrink-0 font-bold" />
                      ) : (
                        <Plus size={13} className="text-amber-600 shrink-0" />
                      )}
                      <span>{opt}</span>
                    </span>
                    {added && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded shrink-0">
                        Added
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTFA Add-ons Group */}
          <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-sky-100">
              <div className="flex items-center gap-1.5 text-sky-900 font-bold text-xs">
                <Wind size={14} className="text-sky-600" />
                <span>CTFA (Treated Fresh Air) Options</span>
              </div>
              <button
                type="button"
                onClick={handleAddAllCTFA}
                className="text-[11px] font-bold text-sky-800 hover:text-sky-950 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded border border-sky-300 transition cursor-pointer active:scale-95"
              >
                + Add All CTFA
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {CTFA_CHECKLIST_OPTIONS.map((opt) => {
                const added = isOptionAdded(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleToggleAddOption(opt)}
                    className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg border text-left transition cursor-pointer ${
                      added
                        ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold"
                        : "bg-slate-50/70 hover:bg-sky-50 text-slate-700 hover:text-sky-900 border-slate-200 hover:border-sky-300 active:scale-98"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {added ? (
                        <Check size={13} className="text-emerald-600 shrink-0 font-bold" />
                      ) : (
                        <Plus size={13} className="text-sky-600 shrink-0" />
                      )}
                      <span>{opt}</span>
                    </span>
                    {added && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded shrink-0">
                        Added
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden inputs to guarantee React Hook Form registers all fields for submission */}
      <div className="hidden">
        {fields.map((field, idx) => (
          <div key={field.id}>
            <input type="hidden" {...register(`checkList.${idx}.sn` as const)} />
            <input type="hidden" {...register(`checkList.${idx}.checkList` as const)} />
            <input type="hidden" {...register(`checkList.${idx}.condition` as const)} />
            <input type="hidden" {...register(`checkList.${idx}.actionTaken` as const)} />
          </div>
        ))}
      </div>

      {/* MOBILE-FIRST VIEW: Responsive Checklist Cards */}
      <div className="block md:hidden space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            onClick={() => openEditModal(index)}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-teal-50/40 hover:border-teal-300 transition cursor-pointer shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 leading-snug">
                    {field.checkList || `Item #${index + 1}`}
                  </h4>
                  <div className="mt-1">
                    <span
                      className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getConditionBadgeStyle(
                        field.condition
                      )}`}
                    >
                      {field.condition || "Satisfactory / OK"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => openEditModal(index)}
                  className="p-1.5 text-teal-700 hover:bg-teal-100 rounded-lg transition"
                  title="Edit item in window"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Delete item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Action Taken / Servicing Done
              </span>
              {field.actionTaken ? (
                <p className="text-slate-700 font-medium line-clamp-2 leading-relaxed">
                  {field.actionTaken}
                </p>
              ) : (
                <span className="text-teal-700 italic text-xs font-semibold flex items-center gap-1">
                  <span>Tap to log servicing action</span>
                  <Edit3 size={12} />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW: Table for larger screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-teal-800 text-white text-xs uppercase tracking-wider">
              <th className="py-2.5 px-3 rounded-tl-lg font-semibold w-10 text-center">
                SN
              </th>
              <th className="py-2.5 px-4 font-semibold w-5/12">
                Check List Item
              </th>
              <th className="py-2.5 px-4 font-semibold w-3/12">
                Condition
              </th>
              <th className="py-2.5 px-4 font-semibold w-3/12">
                Action Taken
              </th>
              <th className="py-2.5 px-2 rounded-tr-lg text-center w-24">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white border border-slate-200 border-t-0">
            {fields.map((field, index) => (
              <tr key={field.id} className="hover:bg-slate-50/70 transition">
                <td className="p-3 text-center font-bold text-slate-600">
                  {index + 1}
                </td>

                <td className="p-3 px-4 font-semibold text-slate-800">
                  {field.checkList}
                </td>

                <td className="p-3 px-4">
                  <span
                    className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border ${getConditionBadgeStyle(
                      field.condition
                    )}`}
                  >
                    {field.condition || "Satisfactory / OK"}
                  </span>
                </td>

                <td className="p-3 px-4 text-xs text-slate-700 leading-relaxed">
                  {field.actionTaken || <span className="text-slate-400 italic">None logged</span>}
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
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 size={15} />
                      </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* WINDOW ON TOP (MODAL DIALOG FOR PPM INSPECTION ITEM EDITING) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative text-left">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4 text-teal-800">
              <Wrench size={20} className="text-teal-700" />
              <h3 className="font-bold text-base sm:text-lg">
                {editingIndex !== null ? `Inspection Item #${editingIndex + 1}` : "Add Custom Inspection Item"}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Particular / Check List Item <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemData.checkList}
                  onChange={(e) =>
                    setItemData((prev) => ({ ...prev, checkList: e.target.value }))
                  }
                  placeholder="e.g. Cleaning of ionisation needle/brush/tube"
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-600 outline-none"
                  autoFocus={editingIndex === null}
                />

                {/* Quick preset selector buttons */}
                <div className="mt-2 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Quick option presets:
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                    {EAC_CHECKLIST_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setItemData((prev) => ({ ...prev, checkList: opt }))}
                        className="text-[11px] px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition cursor-pointer text-left"
                      >
                        ⚡ {opt}
                      </button>
                    ))}
                    {CTFA_CHECKLIST_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setItemData((prev) => ({ ...prev, checkList: opt }))}
                        className="text-[11px] px-2 py-0.5 rounded bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 transition cursor-pointer text-left"
                      >
                        🌀 {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Observed Equipment Condition <span className="text-rose-500">*</span>
                </label>

                {/* Quick Select Buttons */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PPM_CONDITION_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setItemData((prev) => ({ ...prev, condition: preset }))}
                      className={`px-2.5 py-1 text-xs rounded-lg font-semibold border transition cursor-pointer ${
                        itemData.condition === preset
                          ? "bg-teal-700 text-white border-teal-700 shadow-2xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={itemData.condition}
                  onChange={(e) =>
                    setItemData((prev) => ({ ...prev, condition: e.target.value }))
                  }
                  placeholder="e.g. Satisfactory / OK"
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Action Taken / Servicing Work Done
                </label>
                <textarea
                  rows={3}
                  value={itemData.actionTaken}
                  onChange={(e) =>
                    setItemData((prev) => ({ ...prev, actionTaken: e.target.value }))
                  }
                  placeholder="Describe maintenance action (e.g. Cleaned with alcohol swabs, replaced fuse, reconnected loose terminal, tested ion output...)"
                  className="w-full border border-teal-200 bg-teal-50/20 rounded-xl p-3 text-sm text-slate-800 focus:ring-2 focus:ring-teal-600 outline-none leading-relaxed"
                />
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
                <span>Save Inspection Item</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
