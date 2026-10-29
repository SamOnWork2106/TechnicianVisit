import type { UseFormRegister } from "react-hook-form";
import type { CommissioningForm } from "../../types/commissioning";
import { Building, User, MapPin, Phone, Mail, FolderKanban } from "lucide-react";

interface Props {
  register: UseFormRegister<CommissioningForm>;
}

export default function ClientSection({ register }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Building className="text-teal-700" size={20} />
        <h2 className="text-lg font-bold text-slate-800">
          Client & Site Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <Building size={14} className="text-teal-600" />
            Client Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Studiokon Ventures Private Limited"
            {...register("client.clientName", { required: true })}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <FolderKanban size={14} className="text-teal-600" />
            Project Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. TCI"
            {...register("client.project", { required: true })}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <User size={14} className="text-teal-600" />
            Client Representative <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Mr. Barun"
            {...register("client.clientRepresentative", { required: true })}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <MapPin size={14} className="text-teal-600" />
            Location (City / Area) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Gurgaon"
            {...register("client.location", { required: true })}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <Phone size={14} className="text-teal-600" />
            Representative Contact No.
          </label>
          <input
            type="text"
            placeholder="e.g. 9310384285"
            {...register("client.contactNo")}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <Mail size={14} className="text-teal-600" />
            Representative Email
          </label>
          <input
            type="email"
            placeholder="e.g. barun.upadhyay@skvindia.com"
            {...register("client.email")}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <MapPin size={14} className="text-teal-600" />
            Client Full Address
          </label>
          <input
            type="text"
            placeholder="e.g. Plot No. 57, Urban Estate, Gurgaon Sector-18, Gurgaon Haryana-122015"
            {...register("client.clientAddress")}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
