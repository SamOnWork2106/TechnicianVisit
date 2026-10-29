import { useForm } from "react-hook-form";
import { login } from "../../services/authService";
import type { LoginRequest } from "../../types/auth";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, UserCheck, ArrowRight, Wrench } from "lucide-react";
import InstallPwaButton from "../../components/common/InstallPwaButton";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<LoginRequest>({
    defaultValues: {
      employeeId: "",
      password: "",
    },
  });

  const { setEmployee } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginRequest) => {
    try {
      const response = await login(data);

      if (response.success && response.employee) {
        setEmployee(response.employee);
        toast.success(`Welcome back, ${response.employee.name}!`);
        navigate("/report");
      } else {
        toast.error("Invalid Employee ID or Password");
      }
    } catch (error) {
      console.error(error);
      toast.error("Login failed. Make sure backend is running.");
    }
  };

  const handleQuickFill = (id: string, pass: string) => {
    setValue("employeeId", id);
    setValue("password", pass);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      {/* Top Mobile Install Quick Access */}
      <div className="mb-4">
        <InstallPwaButton />
      </div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        {/* Authentic IntelliGreen Logo Header */}
        <div className="bg-white p-6 border-b border-slate-100 text-center">
          <div className="flex justify-center mb-3">
            <img
              src="/company_logo.png"
              alt="IntelliGreen Technologies"
              className="h-16 w-auto object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Wrench size={13} className="text-emerald-700" />
            Field Technician Portal
          </div>

          <p className="text-xs text-slate-500 mt-2">
            IAQ Commissioning & Periodic Preventive Maintenance (PPM)
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-7 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <UserCheck size={14} className="text-teal-700" />
              Employee ID
            </label>
            <input
              type="text"
              placeholder="e.g. LokendraS"
              {...register("employeeId", { required: true })}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock size={14} className="text-teal-700" />
              Password / Mobile No.
            </label>
            <input
              type="password"
              placeholder="Enter password"
              {...register("password", { required: true })}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              "Signing In..."
            ) : (
              <>
                Sign In to Field Portal
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Quick Technician Credentials Helper */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 mb-2 text-center">
              Quick Technician Demo Logins:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill("LokendraS", "8005575735")}
                className="p-1.5 px-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-left transition cursor-pointer"
              >
                <div className="font-bold text-slate-800">Lokendra Singh</div>
                <div className="text-[10px] text-slate-500 font-mono">LokendraS</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("HimanshuA", "7303032596")}
                className="p-1.5 px-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-left transition cursor-pointer"
              >
                <div className="font-bold text-slate-800">Himanshu Agarwal</div>
                <div className="text-[10px] text-slate-500 font-mono">HimanshuA</div>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="text-center text-xs text-slate-500 mt-6">
        IntelliGreen Technologies Pvt. Ltd.
      </div>
    </div>
  );
}