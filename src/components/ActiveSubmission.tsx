import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
  MessageSquare,
  FileText,
  Calendar,
  Clock,
  User,
  PaperclipIcon,
  Send,
} from "lucide-react";
import {
  getTickets,
  Ticket,
  getMessages,
  Message,
  sendMessage,
} from "../lib/api";

const ActiveSubmission = () => {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        if (!profile) return;

        // For clients, we need to get their client ID first
        if (profile.role === "client") {
          const { data: clientData } = await supabase
            .from("clients")
            .select("id")
            .eq("user_id", user?.id)
            .single();

          if (clientData) {
            const ticketsData = await getTickets(clientData.id);
            setTickets(ticketsData);

            // Set the most recent active ticket as the active one
            if (ticketsData.length > 0) {
              const activeTickets = ticketsData.filter(
                (t) => t.status !== "complete",
              );
              setActiveTicket(
                activeTickets.length > 0 ? activeTickets[0] : ticketsData[0],
              );
            }
          }
        } else {
          // For technicians or admins, get all tickets
          const ticketsData = await getTickets();
          setTickets(ticketsData);

          if (ticketsData.length > 0) {
            setActiveTicket(ticketsData[0]);
          }
        }
      } catch (err) {
        console.error("Error loading tickets:", err);
        setError("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [user, profile]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeTicket) return;

      try {
        // First get the chat for this ticket
        const { data: chatData } = await supabase
          .from("chats")
          .select("id")
          .eq("ticket_id", activeTicket.id)
          .single();

        if (chatData) {
          const messagesData = await getMessages(chatData.id);
          setMessages(messagesData);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };

    loadMessages();
  }, [activeTicket]);

  const handleSendMessage = async () => {
    if (!activeTicket || !user || !newMessage.trim()) return;

    try {
      // Get or create chat for this ticket
      let chatId: string;

      const { data: existingChat } = await supabase
        .from("chats")
        .select("id")
        .eq("ticket_id", activeTicket.id)
        .single();

      if (existingChat) {
        chatId = existingChat.id;
      } else {
        // Create a new chat
        const { data: newChat } = await supabase
          .from("chats")
          .insert({
            ticket_id: activeTicket.id,
            subject: activeTicket.title,
            status: "active",
            last_activity: new Date().toISOString(),
          })
          .select()
          .single();

        if (!newChat) throw new Error("Failed to create chat");
        chatId = newChat.id;
      }

      // Send the message
      await sendMessage(chatId, user.id, newMessage);

      // Refresh messages
      const messagesData = await getMessages(chatId);
      setMessages(messagesData);

      // Clear input
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "complete":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg">No submissions found.</p>
              <p className="text-gray-500 mt-2">
                {profile?.role === "client"
                  ? "Create a new submission using the form below."
                  : "No tickets have been assigned to you yet."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Active Submission</h2>

        {tickets.length > 1 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Switch submission:</span>
            <select
              className="border rounded p-1 text-sm"
              value={activeTicket?.id || ""}
              onChange={(e) => {
                const selected = tickets.find((t) => t.id === e.target.value);
                if (selected) setActiveTicket(selected);
              }}
            >
              {tickets.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {ticket.title} ({ticket.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeTicket && (
        <Card className="w-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl font-bold">
                {activeTicket.title}
              </CardTitle>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                {activeTicket.type === "support" ? (
                  <MessageSquare className="h-3 w-3" />
                ) : (
                  <FileText className="h-3 w-3" />
                )}
                {activeTicket.type === "support"
                  ? "Support Ticket"
                  : activeTicket.type === "hardware"
                    ? "Hardware Request"
                    : "Software Request"}
              </Badge>
              <Badge className={getStatusColor(activeTicket.status)}>
                {activeTicket.status === "pending"
                  ? "Pending"
                  : activeTicket.status === "in-progress"
                    ? "In Progress"
                    : "Complete"}
              </Badge>
              {activeTicket.priority && (
                <Badge className={getPriorityColor(activeTicket.priority)}>
                  Priority:{" "}
                  {activeTicket.priority.charAt(0).toUpperCase() +
                    activeTicket.priority.slice(1)}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-gray-700">{activeTicket.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                      {activeTicket.client?.user && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-500">Submitted by:</span>
                          <span>{activeTicket.client.user.fullName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-500">Created:</span>
                        <span>{formatDate(activeTicket.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-500">Last updated:</span>
                        <span>{formatDate(activeTicket.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status update buttons for technicians */}
                  {profile?.role === "technician" &&
                    activeTicket.status !== "complete" && (
                      <div className="flex justify-end gap-2">
                        {activeTicket.status === "pending" && (
                          <Button
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            onClick={async () => {
                              try {
                                await supabase
                                  .from("tickets")
                                  .update({
                                    status: "in-progress",
                                    updated_at: new Date().toISOString(),
                                  })
                                  .eq("id", activeTicket.id);

                                // Update local state
                                setActiveTicket({
                                  ...activeTicket,
                                  status: "in-progress",
                                  updatedAt: new Date().toISOString(),
                                });

                                // Update tickets list
                                setTickets(
                                  tickets.map((t) =>
                                    t.id === activeTicket.id
                                      ? {
                                          ...t,
                                          status: "in-progress",
                                          updatedAt: new Date().toISOString(),
                                        }
                                      : t,
                                  ),
                                );
                              } catch (err) {
                                console.error("Error updating status:", err);
                              }
                            }}
                          >
                            Mark as In Progress
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          onClick={async () => {
                            try {
                              await supabase
                                .from("tickets")
                                .update({
                                  status: "complete",
                                  updated_at: new Date().toISOString(),
                                })
                                .eq("id", activeTicket.id);

                              // Update local state
                              setActiveTicket({
                                ...activeTicket,
                                status: "complete",
                                updatedAt: new Date().toISOString(),
                              });

                              // Update tickets list
                              setTickets(
                                tickets.map((t) =>
                                  t.id === activeTicket.id
                                    ? {
                                        ...t,
                                        status: "complete",
                                        updatedAt: new Date().toISOString(),
                                      }
                                    : t,
                                ),
                              );
                            } catch (err) {
                              console.error("Error updating status:", err);
                            }
                          }}
                        >
                          Mark as Complete
                        </Button>
                      </div>
                    )}
                </div>
              </TabsContent>

              <TabsContent value="chat">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-md p-4 h-64 overflow-y-auto">
                    {messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.senderId === user?.id
                                  ? "bg-primary text-white"
                                  : "bg-white border border-gray-200"
                              }`}
                            >
                              <div className="text-sm">{message.message}</div>
                              <div className="text-xs mt-1 text-right opacity-70">
                                {formatDate(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p>No messages yet</p>
                          <p className="text-sm">
                            Start the conversation by sending a message
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                      rows={2}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="h-full"
                    >
                      <Send className="h-4 w-4 mr-1" /> Send
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActiveSubmission;
