import React from "react";
import Header from "./Header";
import TechnicianDashboard from "./TechnicianDashboard";
import { useAuth } from "../contexts/AuthContext";

const TechnicianRoute = () => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        companyName="TechSupport MSP"
        userName={profile?.fullName || "Technician"}
        userAvatar={profile?.avatarUrl}
      />
      <TechnicianDashboard />
    </div>
  );
};

export default TechnicianRoute;
