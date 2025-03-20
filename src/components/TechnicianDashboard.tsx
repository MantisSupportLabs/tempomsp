import React, { useState } from "react";
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

interface ChatMessage {
  id: string;
  sender: "client" | "technician";
  message: string;
  timestamp: Date;
  read: boolean;
}

interface Chat {
  id: string;
  clientName: string;
  clientId: string;
  subject: string;
  status: "active" | "waiting" | "closed";
  lastActivity: Date;
  messages: ChatMessage[];
  unreadCount: number;
}

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  avatar?: string;
}

interface TechnicianDashboardProps {
  initialChats?: Chat[];
  initialClients?: Client[];
  currentTechnician?: string;
}

const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({
  initialChats = [
    {
      id: "chat1",
      clientName: "John Smith",
      clientId: "client1",
      subject: "Email Configuration Issue",
      status: "active",
      lastActivity: new Date(Date.now() - 15 * 60000),
      unreadCount: 2,
      messages: [
        {
          id: "msg1",
          sender: "client",
          message: "I can't access my company email on my new laptop.",
          timestamp: new Date(Date.now() - 60 * 60000),
          read: true,
        },
        {
          id: "msg2",
          sender: "technician",
          message: "Have you tried resetting your password?",
          timestamp: new Date(Date.now() - 45 * 60000),
          read: true,
        },
        {
          id: "msg3",
          sender: "client",
          message: "Yes, but I'm still getting an authentication error.",
          timestamp: new Date(Date.now() - 30 * 60000),
          read: true,
        },
        {
          id: "msg4",
          sender: "client",
          message: "The error code is AUTH-5523 if that helps.",
          timestamp: new Date(Date.now() - 15 * 60000),
          read: false,
        },
      ],
    },
    {
      id: "chat2",
      clientName: "Sarah Johnson",
      clientId: "client2",
      subject: "VPN Connection Problem",
      status: "waiting",
      lastActivity: new Date(Date.now() - 2 * 60000),
      unreadCount: 1,
      messages: [
        {
          id: "msg5",
          sender: "client",
          message: "I'm unable to connect to the company VPN from home.",
          timestamp: new Date(Date.now() - 10 * 60000),
          read: true,
        },
        {
          id: "msg6",
          sender: "technician",
          message: "What error message are you seeing?",
          timestamp: new Date(Date.now() - 5 * 60000),
          read: true,
        },
        {
          id: "msg7",
          sender: "client",
          message: "It says 'Connection timed out' after about 30 seconds.",
          timestamp: new Date(Date.now() - 2 * 60000),
          read: false,
        },
      ],
    },
    {
      id: "chat3",
      clientName: "Michael Brown",
      clientId: "client3",
      subject: "Printer Not Working",
      status: "active",
      lastActivity: new Date(Date.now() - 120 * 60000),
      unreadCount: 0,
      messages: [
        {
          id: "msg8",
          sender: "client",
          message: "The office printer isn't responding to print jobs.",
          timestamp: new Date(Date.now() - 180 * 60000),
          read: true,
        },
        {
          id: "msg9",
          sender: "technician",
          message:
            "Have you checked if it's turned on and connected to the network?",
          timestamp: new Date(Date.now() - 150 * 60000),
          read: true,
        },
        {
          id: "msg10",
          sender: "client",
          message: "Yes, it's on and the network light is green.",
          timestamp: new Date(Date.now() - 120 * 60000),
          read: true,
        },
      ],
    },
  ],
  initialClients = [
    {
      id: "client1",
      name: "John Smith",
      company: "Acme Corp",
      email: "john.smith@acmecorp.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    },
    {
      id: "client2",
      name: "Sarah Johnson",
      company: "TechStart Inc",
      email: "sarah.j@techstart.io",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    },
    {
      id: "client3",
      name: "Michael Brown",
      company: "Global Solutions",
      email: "m.brown@globalsolutions.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    },
    {
      id: "client4",
      name: "Emily Davis",
      company: "Innovate LLC",
      email: "emily.d@innovatellc.net",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    },
    {
      id: "client5",
      name: "Robert Wilson",
      company: "DataSphere",
      email: "r.wilson@datasphere.org",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert",
    },
  ],
  currentTechnician = "Alex Technician",
}) => {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [chatFilter, setChatFilter] = useState<
    "all" | "active" | "waiting" | "closed"
  >("all");

  // Handle selecting a chat
  const handleSelectChat = (chat: Chat) => {
    // Mark all messages as read
    const updatedChat = {
      ...chat,
      unreadCount: 0,
      messages: chat.messages.map((msg) => ({ ...msg, read: true })),
    };

    setActiveChat(updatedChat);

    // Update the chat in the chats array
    setChats((prevChats) =>
      prevChats.map((c) => (c.id === chat.id ? updatedChat : c)),
    );
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!activeChat || !newMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg${Date.now()}`,
      sender: "technician",
      message: newMessage,
      timestamp: new Date(),
      read: true,
    };

    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, newMsg],
      lastActivity: new Date(),
    };

    setActiveChat(updatedChat);
    setChats((prevChats) =>
      prevChats.map((c) => (c.id === activeChat.id ? updatedChat : c)),
    );
    setNewMessage("");
  };

  // Handle client switch
  const handleClientSwitch = (clientId: string) => {
    setSelectedClient(clientId);

    // Find if there's an existing chat with this client
    const existingChat = chats.find((chat) => chat.clientId === clientId);

    if (existingChat) {
      handleSelectChat(existingChat);
    } else {
      // If no existing chat, create a new one
      const client = clients.find((c) => c.id === clientId);
      if (client) {
        const newChat: Chat = {
          id: `chat${Date.now()}`,
          clientName: client.name,
          clientId: client.id,
          subject: "New Conversation",
          status: "active",
          lastActivity: new Date(),
          unreadCount: 0,
          messages: [],
        };

        setChats((prevChats) => [...prevChats, newChat]);
        setActiveChat(newChat);
      }
    }
  };

  // Filter chats based on selected filter
  const filteredChats = chats.filter((chat) => {
    if (chatFilter === "all") return true;
    return chat.status === chatFilter;
  });

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-100">
      {/* Sidebar with chat list */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Technician Dashboard</h2>
          <p className="text-sm text-gray-500">
            Logged in as {currentTechnician}
          </p>
        </div>

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
                  <div className="font-medium">{chat.clientName}</div>
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
                    {chat.status.charAt(0).toUpperCase() + chat.status.slice(1)}
                  </Badge>
                  {chat.unreadCount > 0 && (
                    <Badge className="bg-primary">{chat.unreadCount}</Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No chats found</div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{activeChat.clientName}</h2>
                <p className="text-sm text-gray-500">{activeChat.subject}</p>
              </div>
              <Select value={selectedClient} onValueChange={handleClientSwitch}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Switch client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.company})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {activeChat.messages.length > 0 ? (
                activeChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${message.sender === "technician" ? "justify-end" : "justify-start"}`}
                  >
                    {message.sender === "client" && (
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage
                          src={
                            clients.find((c) => c.id === activeChat.clientId)
                              ?.avatar
                          }
                        />
                        <AvatarFallback>
                          {activeChat.clientName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${message.sender === "technician" ? "bg-primary text-white" : "bg-white border border-gray-200"}`}
                    >
                      <div className="text-sm">{message.message}</div>
                      <div className="text-xs mt-1 text-right text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {message.sender === "technician" && (
                      <Avatar className="h-8 w-8 ml-2">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {currentTechnician
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
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
                        {client.name} ({client.company})
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
