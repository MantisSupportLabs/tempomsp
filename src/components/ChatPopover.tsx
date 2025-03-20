import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { MessageSquare, Send } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import {
  Chat,
  Message,
  getChatMessages,
  getUserChats,
  markChatAsRead,
  sendMessage,
} from "../lib/chat";

interface ChatPopoverProps {
  unreadCount: number;
  onCountChange: (count: number) => void;
}

const ChatPopover = ({ unreadCount, onCountChange }: ChatPopoverProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const fetchChats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getUserChats(user.id);
      setChats(data);

      // If there are chats and no selected chat, select the first one
      if (data.length > 0 && !selectedChat) {
        setSelectedChat(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!user || !selectedChat) return;

    try {
      const data = await getChatMessages(selectedChat);
      setMessages(data);

      // Mark messages as read
      await markChatAsRead(selectedChat, user.id);

      // Update unread count
      const unreadMessagesInThisChat = data.filter(
        (msg) => !msg.read && msg.user_id !== user.id,
      ).length;

      if (unreadMessagesInThisChat > 0) {
        onCountChange(Math.max(0, unreadCount - unreadMessagesInThisChat));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchChats();
    }
  }, [open, user]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
    }
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!user || !selectedChat || !newMessage.trim()) return;

    try {
      const message = await sendMessage(selectedChat, user.id, newMessage);
      setMessages((prev) => [...prev, { ...message, user }]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getOtherParticipant = (chat: any) => {
    if (!user || !chat.chat_participants) return "Unknown";

    const otherParticipant = chat.chat_participants.find(
      (p: any) => p.user_id !== user.id,
    );

    return otherParticipant ? otherParticipant.user_id : "Unknown";
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 bg-green-500 rounded-full"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {!selectedChat ? (
          <div>
            <div className="p-4 border-b">
              <h3 className="font-medium">Chats</h3>
            </div>
            <ScrollArea className="h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No chats
                </div>
              ) : (
                <div>
                  {chats.map((chat, index) => {
                    const hasUnread =
                      chat.last_message &&
                      !chat.last_message.read &&
                      chat.last_message.user_id !== user?.id;

                    return (
                      <div key={chat.id}>
                        <div
                          className={`p-4 cursor-pointer hover:bg-muted transition-colors ${hasUnread ? "bg-muted/50" : ""}`}
                          onClick={() => setSelectedChat(chat.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {getOtherParticipant(chat)
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium text-sm truncate">
                                  {getOtherParticipant(chat)}
                                </h4>
                                {chat.last_message && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatMessageTime(
                                      chat.last_message.created_at,
                                    )}
                                  </span>
                                )}
                              </div>
                              {chat.last_message && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {chat.last_message.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        {index < chats.length - 1 && <Separator />}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col h-[400px]">
            <div className="p-3 border-b flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="mr-2"
                onClick={() => setSelectedChat(null)}
              >
                Back
              </Button>
              <h3 className="font-medium text-sm">Chat</h3>
            </div>
            <ScrollArea className="flex-1 p-3">
              {messages.map((message) => {
                const isCurrentUser = message.user_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`mb-3 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {formatMessageTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
            <div className="p-3 border-t flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default ChatPopover;
