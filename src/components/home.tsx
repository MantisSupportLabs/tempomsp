import React from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import StatusTracker from "./StatusTracker";
import SubmissionForm from "./SubmissionForm";
import SubmissionHistory from "./SubmissionHistory";
import SubmissionDetails from "./SubmissionDetails";
import { Button } from "./ui/button";

const Home = () => {
  // Mock data for status tracker
  const statusItems = [
    { status: "pending", count: 3 },
    { status: "in-progress", count: 2 },
    { status: "complete", count: 5 },
  ];

  // Mock submissions for history
  const submissions = [
    {
      id: "1",
      type: "Support Ticket",
      title: "Email not working",
      date: new Date(2023, 5, 15),
      status: "In Progress",
      priority: "High",
      description: "Unable to send or receive emails since this morning.",
    },
    {
      id: "2",
      type: "Hardware Request",
      title: "New laptop",
      date: new Date(2023, 5, 10),
      status: "Pending",
      description: "Request for a new development laptop with 32GB RAM.",
    },
    {
      id: "3",
      type: "Software Request",
      title: "Adobe Creative Suite",
      date: new Date(2023, 5, 5),
      status: "Complete",
      description:
        "License request for Adobe Creative Suite for the design team.",
    },
  ];

  // Mock handlers for form submissions
  const handleTicketSubmit = (values: any) => {
    console.log("Support ticket submitted:", values);
    // In a real app, this would send data to an API
  };

  const handleRequestSubmit = (values: any) => {
    console.log("Request submitted:", values);
    // In a real app, this would send data to an API
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header companyName="TechSupport MSP" userName="John Doe" />

      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-end">
          <Link to="/technician">
            <Button variant="outline" size="sm" className="text-xs">
              Switch to Technician View
            </Button>
          </Link>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Status Tracker Section */}
        <section>
          <StatusTracker items={statusItems} />
        </section>

        {/* Submission Form Section */}
        <section>
          <SubmissionForm
            onSubmitTicket={handleTicketSubmit}
            onSubmitRequest={handleRequestSubmit}
            defaultTab="ticket"
            defaultStatus="pending"
          />
        </section>

        {/* Submission History Section */}
        <section>
          <SubmissionHistory submissions={submissions} />
        </section>
      </main>

      {/* This component would typically be shown conditionally when a user clicks to view details */}
      {/* For demonstration purposes, it's hidden by default */}
      <div className="hidden">
        <SubmissionDetails isOpen={false} />
      </div>
    </div>
  );
};

export default Home;
