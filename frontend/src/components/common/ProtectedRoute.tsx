import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { employee, token } = useAuth();

  // If not authenticated or missing cryptographic JWT, bounce back to login
  if (!employee || !token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

