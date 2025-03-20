import { supabase } from "./supabase";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }

  return data as Notification[];
};

export const getUnreadNotificationsCount = async (userId: string) => {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    console.error("Error fetching unread notifications count:", error);
    throw error;
  }

  return count || 0;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true, updated_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};
