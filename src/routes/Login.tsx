import React from "react";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Login = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If already logged in, redirect based on role
  if (user && profile) {
    if (profile.role === "technician") {
      return <Navigate to="/technician" replace />;
    } else if (profile.role === "client") {
      return <Navigate to="/" replace />;
    } else if (profile.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-primary">
          TechSupport MSP
        </h1>
        <h2 className="mt-2 text-center text-xl text-gray-600">
          Support Portal
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
