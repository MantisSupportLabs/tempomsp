import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import StatusTracker from "./StatusTracker";
import SubmissionForm from "./SubmissionForm";
import SubmissionHistory from "./SubmissionHistory";
import SubmissionDetails from "./SubmissionDetails";
import ActiveSubmission from "./ActiveSubmission";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { getTickets, Ticket, TicketStatus } from "../lib/api";

const Home = () => {
  const { user, profile } = useAuth();
  const [statusItems, setStatusItems] = useState([
    { status: "pending", count: 0 },
    { status: "in-progress", count: 0 },
    { status: "complete", count: 0 },
  ]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const loadClientData = async () => {
      try {
        setLoading(true);
        if (!user) return;

        // Get client ID for the current user
        const { data: clientData } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (clientData) {
          // Get tickets for this client
          const ticketsData = await getTickets(clientData.id);
          setTickets(ticketsData);

          // Update status counts
          const counts = {
            pending: 0,
            "in-progress": 0,
            complete: 0,
          };

          ticketsData.forEach((ticket) => {
            counts[ticket.status as TicketStatus] += 1;
          });

          setStatusItems([
            { status: "pending", count: counts.pending },
            { status: "in-progress", count: counts["in-progress"] },
            { status: "complete", count: counts.complete },
          ]);
        }
      } catch (err) {
        console.error("Error loading client data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadClientData();

    // Set up realtime subscription for tickets
    const ticketsSubscription = supabase
      .channel("tickets-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tickets",
        },
        () => {
          // Reload data when tickets change
          loadClientData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsSubscription);
    };
  }, [user]);

  // Handler for form submissions
  const handleTicketSubmit = async (values: any) => {
    try {
      if (!user) return;

      // Get client ID for the current user
      const { data: clientData } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!clientData) throw new Error("Client record not found");

      // Create the ticket
      const { data: ticketData, error } = await supabase
        .from("tickets")
        .insert({
          client_id: clientData.id,
          title: values.title,
          description: values.description,
          type: "support",
          status: values.status || "pending",
          priority: values.priority,
        })
        .select()
        .single();

      if (error) throw error;

      // Reload tickets
      const ticketsData = await getTickets(clientData.id);
      setTickets(ticketsData);

      // Show success message
      alert("Support ticket submitted successfully!");
    } catch (err) {
      console.error("Error submitting ticket:", err);
      alert("Failed to submit ticket. Please try again.");
    }
  };

  const handleRequestSubmit = async (values: any) => {
    try {
      if (!user) return;

      // Get client ID for the current user
      const { data: clientData } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!clientData) throw new Error("Client record not found");

      // Create the ticket
      const { data: ticketData, error } = await supabase
        .from("tickets")
        .insert({
          client_id: clientData.id,
          title: values.itemName,
          description: `${values.specifications}\n\nJustification: ${values.justification}`,
          type: values.itemType === "software" ? "software" : "hardware",
          status: "pending",
          priority: values.urgency,
        })
        .select()
        .single();

      if (error) throw error;

      // Reload tickets
      const ticketsData = await getTickets(clientData.id);
      setTickets(ticketsData);

      // Show success message
      alert("Request submitted successfully!");
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Failed to submit request. Please try again.");
    }
  };

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDetailsOpen(true);
  };

  // Convert tickets to the format expected by SubmissionHistory
  const submissionsForHistory = tickets.map((ticket) => ({
    id: ticket.id,
    type:
      ticket.type === "support"
        ? "Support Ticket"
        : ticket.type === "hardware"
          ? "Hardware Request"
          : "Software Request",
    title: ticket.title,
    date: new Date(ticket.createdAt),
    status:
      ticket.status === "pending"
        ? "Pending"
        : ticket.status === "in-progress"
          ? "In Progress"
          : "Complete",
    priority: ticket.priority
      ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)
      : undefined,
    description: ticket.description,
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        companyName="TechSupport MSP"
        userName={profile?.fullName || "Client"}
        userAvatar={profile?.avatarUrl}
      />

      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-end">
          {profile?.role === "admin" && (
            <Link to="/technician">
              <Button variant="outline" size="sm" className="text-xs">
                Switch to Technician View
              </Button>
            </Link>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Status Tracker Section */}
        <section>
          <StatusTracker items={statusItems} />
        </section>

        {/* Active Submission Section */}
        <section>
          <ActiveSubmission />
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
          <SubmissionHistory submissions={submissionsForHistory} />
        </section>
      </main>

      {/* Submission Details Dialog */}
      {selectedTicket && (
        <SubmissionDetails
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          submission={{
            id: selectedTicket.id,
            title: selectedTicket.title,
            type:
              selectedTicket.type === "support"
                ? "Support Ticket"
                : selectedTicket.type === "hardware"
                  ? "Hardware Request"
                  : "Software Request",
            status:
              selectedTicket.status === "pending"
                ? "Pending"
                : selectedTicket.status === "in-progress"
                  ? "In Progress"
                  : "Complete",
            description: selectedTicket.description,
            priority: selectedTicket.priority as any,
            createdAt: selectedTicket.createdAt,
            updatedAt: selectedTicket.updatedAt,
            submittedBy: selectedTicket.client?.user?.fullName || "Unknown",
          }}
        />
      )}
    </div>
  );
};

export default Home;
