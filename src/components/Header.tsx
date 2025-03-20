import React, { useEffect, useState } from "react";
import { HelpCircle, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { signOut } from "../lib/auth";
import { useAuth } from "../contexts/AuthContext";
import NotificationsPopover from "./NotificationsPopover";
import ChatPopover from "./ChatPopover";
import { getUnreadMessagesCount } from "../lib/chat";
import { getUnreadNotificationsCount } from "../lib/notifications";

interface HeaderProps {
  companyName?: string;
  userAvatar?: string;
  userName?: string;
}

const Header = ({
  companyName = "TechSupport MSP",
  userAvatar = "",
  userName = "John Doe",
}: HeaderProps) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!user) return;

      try {
        const notificationsCount = await getUnreadNotificationsCount(user.id);
        const messagesCount = await getUnreadMessagesCount(user.id);

        setUnreadNotifications(notificationsCount);
        setUnreadMessages(messagesCount);
      } catch (error) {
        console.error("Error fetching unread counts:", error);
      }
    };

    fetchUnreadCounts();

    // Set up an interval to check for new notifications/messages
    const interval = setInterval(fetchUnreadCounts, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleSignOut = async () => {
    try {
      const success = await signOut();
      if (success) {
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Use profile name if available, otherwise fall back to the prop
  const displayName = profile?.full_name || userName;

  return (
    <header className="w-full h-20 px-6 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-primary">{companyName}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <NotificationsPopover
          unreadCount={unreadNotifications}
          onCountChange={setUnreadNotifications}
        />

        <ChatPopover
          unreadCount={unreadMessages}
          onCountChange={setUnreadMessages}
        />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Help & FAQ</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2 cursor-pointer">
              <Avatar>
                <AvatarImage src={userAvatar} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {displayName
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:inline-block">
                {displayName}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
