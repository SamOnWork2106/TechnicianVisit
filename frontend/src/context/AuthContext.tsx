import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Employee } from "../types/auth";

interface AuthContextType {
  employee: Employee | null;
  token: string | null;
  setSession: (employee: Employee | null, token: string | null) => void;
  setEmployee: (employee: Employee | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EMPLOYEE_STORAGE_KEY = "intelligreen_employee_session";
const TOKEN_STORAGE_KEY = "intelligreen_auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployeeState] = useState<Employee | null>(() => {
    try {
      const saved = localStorage.getItem(EMPLOYEE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setTokenState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const setSession = (emp: Employee | null, jwtToken: string | null) => {
    setEmployeeState(emp);
    setTokenState(jwtToken);
    try {
      if (emp && jwtToken) {
        localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(emp));
        localStorage.setItem(TOKEN_STORAGE_KEY, jwtToken);
      } else {
        localStorage.removeItem(EMPLOYEE_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Failed to persist session:", e);
    }
  };

  const setEmployee = (emp: Employee | null) => {
    setEmployeeState(emp);
    try {
      if (emp) {
        localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(emp));
      } else {
        localStorage.removeItem(EMPLOYEE_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Failed to persist employee session:", e);
    }
  };

  const logout = () => {
    setSession(null, null);
  };

  return (
    <AuthContext.Provider value={{ employee, token, setSession, setEmployee, logout }}>
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
