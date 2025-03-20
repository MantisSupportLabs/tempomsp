import React from "react";
import Header from "./Header";
import TechnicianDashboard from "./TechnicianDashboard";

const TechnicianRoute = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header companyName="TechSupport MSP" userName="Alex Technician" />
      <TechnicianDashboard />
    </div>
  );
};

export default TechnicianRoute;
