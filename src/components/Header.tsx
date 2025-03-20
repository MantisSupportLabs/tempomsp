import React from "react";
import { Bell, HelpCircle, User, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

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
  return (
    <header className="w-full h-20 px-6 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-primary">{companyName}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/technician">
                <Button variant="ghost" size="icon" className="relative">
                  <MessageSquare className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-green-500 rounded-full"></span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Technician Chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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

        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {userName
                .split(" ")
                .map((name) => name[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden md:inline-block">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
