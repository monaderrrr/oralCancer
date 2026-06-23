import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "../../contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next"; 

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireVerification?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireVerification = false,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role Protection
  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  // Doctor Verification
  if (requireVerification && user.role === "doctor" && !user.isVerified) {
    return <Navigate to="/doctor/verification" replace />;
  }

  return <>{children}</>;
}