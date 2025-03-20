import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and user doesn't have the required role
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect based on role
    if (profile.role === "technician") {
      return <Navigate to="/technician" replace />;
    } else if (profile.role === "client") {
      return <Navigate to="/" replace />;
    } else if (profile.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    // Fallback
    return <Navigate to="/" replace />;
  }

  // If authenticated and has the required role, render children
  return <>{children}</>;
};

export default AuthGuard;
