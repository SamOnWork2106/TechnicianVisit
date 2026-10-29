import { createContext, useContext, useState} from "react";
import type { ReactNode } from "react";
import type { Employee } from "../types/auth";

interface AuthContextType {
  employee: Employee | null;
  setEmployee: (employee: Employee | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "intelligreen_employee_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployeeState] = useState<Employee | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setEmployee = (emp: Employee | null) => {
    setEmployeeState(emp);
    try {
      if (emp) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(emp));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Failed to persist session:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ employee, setEmployee }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}