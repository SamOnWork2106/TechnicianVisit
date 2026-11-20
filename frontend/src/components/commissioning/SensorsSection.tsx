import { useState } from "react";
import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import type { CommissioningForm } from "../../types/commissioning";
import { Network, Plus, Trash2, Edit3, X, Check, Cpu } from "lucide-react";

interface Props {
  control: Control<CommissioningForm>;
  register: UseFormRegister<CommissioningForm>;
  onDeleteSection?: () => void;
}

interface SensorData {
  location: string;
  macId: string;
}

export default function SensorsSection({ control, register, onDeleteSection }: Props) {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "sensors",
  });

  // Modal Window on Top State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [sensorData, setSensorData] = useState<SensorData>({
    location: "",
    macId: "",
  });

  const openAddModal = () => {
    setSensorData({
      location: `Floor ${fields.length + 1}`,
      macId: "",
    });
    setEditingIndex(null);
    setModalOpen(true);
  };

  const openEditModal = (index: number) => {
    const current = fields[index];
    setSensorData({
      location: current.location || `Floor ${index + 1}`,
      macId: current.macId || "",
    });
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!sensorData.location.trim()) {
      sensorData.location = `Floor ${fields.length + 1}`;
    }
    if (editingIndex !== null) {
      update(editingIndex, {
        location: sensorData.location,
        macId: sensorData.macId.toUpperCase(),
      });
    } else {
      append({
        location: sensorData.location,
        macId: sensorData.macId.toUpperCase(),
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
            <Network className="text-teal-700" size={18} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              IAQM Sensors & BMS Integration (RS485 Network)
            </h2>
            <p className="text-xs text-slate-500">
              List sensor deployment locations and network MAC addresses configured for client BMS telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDeleteSection && (
            <button
              type="button"
              onClick={onDeleteSection}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-2xs transition cursor-pointer active:scale-95"
              title="Delete this entire section"
            >
              <Trash2 size={14} className="text-rose-600" />
              <span>Delete Section</span>
            </button>
          )}

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg shadow-2xs transition cursor-pointer active:scale-95"
          >
            <Plus size={15} />
            <span>Add Sensor</span>
          </button>
        </div>
      </div>

      {/* Sensor Installation Description */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Sensor Installation Description <span className="text-slate-400 font-normal lowercase">(optional)</span></span>
        </label>
        <textarea
          rows={2}
          {...register("sensorDescription")}
          className="w-full border border-slate-300 rounded-xl p-3 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          placeholder="Optional: e.g. Further 6 Nos of IAQM (Indoor Air Quality Monitoring) Sensors are installed..."
        />
      </div>

      {/* Hidden inputs to guarantee React Hook Form registers all fields for submission */}
      <div className="hidden">
        {fields.map((field, idx) => (
          <div key={field.id}>
            <input type="hidden" {...register(`sensors.${idx}.location` as const)} />
            <input type="hidden" {...register(`sensors.${idx}.macId` as const)} />
          </div>
        ))}
      </div>

      {/* MOBILE-FIRST VIEW: Responsive Cards */}
      <div className="block md:hidden space-y-3 mb-4">
        {fields.length === 0 ? (
          <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-medium mb-2">No IAQM sensors added yet.</p>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg transition"
            >
              <Plus size={14} /> Add Sensor
            </button>
          </div>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              onClick={() => openEditModal(index)}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-teal-50/40 hover:border-teal-300 transition cursor-pointer shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="font-bold text-sm text-slate-800">
                    {field.location || `Floor ${index + 1}`}
                  </span>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => openEditModal(index)}
                    className="p-1.5 text-teal-700 hover:bg-teal-100 rounded-lg transition"
                    title="Edit sensor"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Delete sensor"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Sensor MAC ID
                </span>
                {field.macId ? (
                  <span className="font-mono font-bold bg-slate-200/80 text-slate-800 px-2.5 py-0.5 rounded text-xs tracking-wider">
                    {field.macId}
                  </span>
                ) : (
                  <span className="text-rose-500 italic text-xs font-medium flex items-center gap-1">
                    <span>Tap to enter MAC ID</span>
                    <Edit3 size={12} />
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP VIEW: Table on larger screens */}
      <div className="hidden md:block overflow-x-auto mb-4">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-teal-800 text-white text-xs uppercase tracking-wider">
              <th className="py-2.5 px-3 rounded-tl-lg font-semibold w-12 text-center">
                #
              </th>
              <th className="py-2.5 px-4 font-semibold w-1/2">
                Floor / Location
              </th>
              <th className="py-2.5 px-4 font-semibold w-1/2">
                Sensor MAC ID
              </th>
              <th className="py-2.5 px-3 rounded-tr-lg text-center w-24">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white border border-slate-200 border-t-0">
            {fields.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-xs font-medium">No IAQM sensors added yet.</p>
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
                    >
                      <Plus size={14} /> Add your first sensor
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              fields.map((field, index) => (
                <tr key={field.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 text-center font-bold text-slate-500">
                    {index + 1}
                  </td>

                  <td className="p-3 px-4 font-medium text-slate-800">
                    {field.location || `Floor ${index + 1}`}
                  </td>

                  <td className="p-3 px-4">
                    {field.macId ? (
                      <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded text-xs tracking-wider border border-slate-200">
                        {field.macId}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">No MAC entered</span>
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
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        title="Remove sensor row"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* WINDOW ON TOP (MODAL DIALOG FOR SENSOR EDITING) */}
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
              <Cpu size={20} className="text-teal-700" />
              <h3 className="font-bold text-base sm:text-lg">
                {editingIndex !== null ? `Edit IAQM Sensor #${editingIndex + 1}` : "Add IAQM Sensor"}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Floor / Deployment Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={sensorData.location}
                  onChange={(e) =>
                    setSensorData((prev) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="e.g. Basement / 1st Floor / Lift Lobby"
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sensor MAC Address / ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={sensorData.macId}
                  onChange={(e) =>
                    setSensorData((prev) => ({ ...prev, macId: e.target.value.toUpperCase() }))
                  }
                  placeholder="e.g. E8:06:90:A6:78:A4"
                  className="w-full border border-teal-300 bg-teal-50/30 rounded-xl p-3 text-sm font-mono font-bold text-slate-800 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none uppercase tracking-wider"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Format: Hexadecimal MAC address as labeled on the physical IAQM hardware sensor.
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
                <span>Save Sensor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
