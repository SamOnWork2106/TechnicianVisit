import { useEffect } from "react";
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
    formState: { isSubmitting },
  } = useForm<LoginRequest>({
    defaultValues: {
      employeeId: "",
      password: "",
    },
  });

  const { setSession, employee, token } = useAuth();
  const navigate = useNavigate();

  // If already authenticated with a valid session, redirect directly to report portal
  useEffect(() => {
    if (employee && token) {
      navigate("/report", { replace: true });
    }
  }, [employee, token, navigate]);

  const onSubmit = async (data: LoginRequest) => {
    try {
      const response = await login(data);

      if (response.success && response.employee && response.token) {
        setSession(response.employee, response.token);
        toast.success(`Welcome back, ${response.employee.name}!`);
        navigate("/report");
      } else {
        toast.error(response.message || "Invalid Employee ID or Password");
      }
    } catch (error: any) {
      console.error(error);
      const detail = error.response?.data?.detail;
      if (error.response?.status === 429) {
        toast.error(detail || "Too many failed attempts. Please wait 1 minute.");
      } else {
        toast.error(detail || "Login failed. Make sure backend is running.");
      }
    }
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
              placeholder="Enter Employee ID"
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
        </form>
      </div>

      <div className="text-center text-xs text-slate-500 mt-6">
        IntelliGreen Technologies Pvt. Ltd.
      </div>
    </div>
  );
}
