import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { MessageSquare, Send, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  getChats,
  getMessages,
  sendMessage,
  Chat,
  Message,
  getClients,
  Client,
} from "../lib/api";
import UserManagement from "./UserManagement";

interface TechnicianDashboardProps {
  currentTechnician?: string;
}

const TechnicianDashboard: React.FC<TechnicianDashboardProps> = () => {
  const { user, profile } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [chatFilter, setChatFilter] = useState<
    "all" | "active" | "waiting" | "closed"
  >("all");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chats");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!user) return;

        // Get technician ID if the user is a technician
        if (profile?.role === "technician") {
          const { data: techData } = await supabase
            .from("technicians")
            .select("id")
            .eq("user_id", user.id)
            .single();

          if (techData) {
            // Load chats for this technician
            const chatsData = await getChats(techData.id);
            setChats(chatsData);
          }
        } else {
          // For admins, load all chats
          const chatsData = await getChats();
          setChats(chatsData);
        }

        // Load clients for the client switcher
        const clientsData = await getClients();
        setClients(clientsData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, profile]);

  // Handle selecting a chat
  const handleSelectChat = async (chat: Chat) => {
    setActiveChat(chat);

    try {
      // Load messages for this chat
      const messagesData = await getMessages(chat.id);
      setMessages(messagesData);

      // Mark messages as read
      if (user) {
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("chat_id", chat.id)
          .neq("sender_id", user.id)
          .eq("read", false);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!activeChat || !user || !newMessage.trim()) return;

    try {
      // Send the message
      await sendMessage(activeChat.id, user.id, newMessage);

      // Refresh messages
      const messagesData = await getMessages(activeChat.id);
      setMessages(messagesData);

      // Clear input
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Handle client switch
  const handleClientSwitch = async (clientId: string) => {
    setSelectedClient(clientId);

    try {
      // Find if there's an existing chat with this client
      const { data: existingChats } = await supabase
        .from("chats")
        .select("*, ticket:tickets!inner(client_id)")
        .eq("ticket.client_id", clientId)
        .order("last_activity", { ascending: false });

      if (existingChats && existingChats.length > 0) {
        // Get the full chat data
        const chatData = await getChats();
        const fullChat = chatData.find((c) => c.id === existingChats[0].id);
        if (fullChat) {
          handleSelectChat(fullChat);
        }
      } else {
        // If no existing chat, create a new ticket and chat
        const client = clients.find((c) => c.id === clientId);
        if (client && user) {
          // Create a new ticket
          const { data: ticketData } = await supabase
            .from("tickets")
            .insert({
              client_id: clientId,
              technician_id: null, // Will be assigned later
              title: "New Support Request",
              description: "Support request initiated by technician",
              type: "support",
              status: "pending",
              priority: "medium",
            })
            .select()
            .single();

          if (ticketData) {
            // Create a new chat
            const { data: chatData } = await supabase
              .from("chats")
              .insert({
                ticket_id: ticketData.id,
                subject: "New Support Request",
                status: "active",
                last_activity: new Date().toISOString(),
              })
              .select()
              .single();

            if (chatData) {
              // Get the full chat data
              const fullChatsData = await getChats();
              const newChat = fullChatsData.find((c) => c.id === chatData.id);
              if (newChat) {
                handleSelectChat(newChat);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error switching client:", err);
    }
  };

  // Filter chats based on selected filter
  const filteredChats = chats.filter((chat) => {
    if (chatFilter === "all") return true;
    return chat.status === chatFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-100">
      {/* Sidebar with chat list */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Technician Dashboard</h2>
          <p className="text-sm text-gray-500">
            Logged in as {profile?.fullName || "Technician"}
          </p>
        </div>

        <div className="p-4 border-b border-gray-200">
          <Tabs
            defaultValue="chats"
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <TabsList className="w-full">
              <TabsTrigger value="chats" className="flex-1">
                Chats
              </TabsTrigger>
              <TabsTrigger value="users" className="flex-1">
                Users
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {activeTab === "chats" && (
          <>
            <div className="p-4 border-b border-gray-200">
              <Select
                value={chatFilter}
                onValueChange={(value) => setChatFilter(value as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter chats" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chats</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-y-auto flex-1">
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${activeChat?.id === chat.id ? "bg-blue-50" : ""}`}
                    onClick={() => handleSelectChat(chat)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium">
                        {chat.ticket?.client?.user?.fullName ||
                          "Unknown Client"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(chat.lastActivity).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 truncate mb-1">
                      {chat.subject}
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge
                        variant="outline"
                        className={`${
                          chat.status === "active"
                            ? "bg-green-100 text-green-800"
                            : chat.status === "waiting"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {chat.status.charAt(0).toUpperCase() +
                          chat.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No chats found
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "users" && (
          <div className="overflow-y-auto flex-1 p-4">
            <Button
              onClick={() => {
                // Show full user management in main area
                setActiveChat(null);
              }}
              className="w-full"
            >
              Manage Users & Companies
            </Button>
          </div>
        )}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {activeTab === "users" ? (
          <UserManagement />
        ) : activeChat ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="font-semibold">
                  {activeChat.ticket?.client?.user?.fullName ||
                    "Unknown Client"}
                </h2>
                <p className="text-sm text-gray-500">{activeChat.subject}</p>
              </div>
              <Select value={selectedClient} onValueChange={handleClientSwitch}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Switch client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.user?.fullName || "Unknown"} (
                      {client.company?.name || "Unknown Company"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    {message.senderId !== user?.id && (
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={message.sender?.avatarUrl} />
                        <AvatarFallback>
                          {message.sender?.fullName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${message.senderId === user?.id ? "bg-primary text-white" : "bg-white border border-gray-200"}`}
                    >
                      <div className="text-sm">{message.message}</div>
                      <div className="text-xs mt-1 text-right text-gray-500">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {message.senderId === user?.id && (
                      <Avatar className="h-8 w-8 ml-2">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {profile?.fullName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "T"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
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

            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 mr-2"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4 mr-1" /> Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium mb-2">No chat selected</h3>
              <p>
                Select a chat from the sidebar or switch to a client to begin
              </p>
              <div className="mt-6">
                <Select
                  value={selectedClient}
                  onValueChange={handleClientSwitch}
                >
                  <SelectTrigger className="w-[250px] mx-auto">
                    <SelectValue placeholder="Switch to a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.user?.fullName || "Unknown"} (
                        {client.company?.name || "Unknown Company"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianDashboard;
