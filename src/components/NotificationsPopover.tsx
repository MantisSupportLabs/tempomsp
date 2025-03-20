import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Bell } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { useAuth } from "../contexts/AuthContext";
import {
  Notification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../lib/notifications";

interface NotificationsPopoverProps {
  unreadCount: number;
  onCountChange: (count: number) => void;
}

const NotificationsPopover = ({
  unreadCount,
  onCountChange,
}: NotificationsPopoverProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, user]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification,
        ),
      );

      // Update unread count
      const newUnreadCount = unreadCount - 1;
      onCountChange(newUnreadCount < 0 ? 0 : newUnreadCount);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          read: true,
        })),
      );
      onCountChange(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {notifications.some((n) => !n.read) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`p-4 cursor-pointer hover:bg-muted transition-colors ${!notification.read ? "bg-muted/50" : ""}`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm">
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
