import { supabase } from "./supabase";

export interface Message {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  read: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    user_metadata: {
      full_name?: string;
    };
  };
}

export interface Chat {
  id: string;
  created_at: string;
  updated_at: string;
  participants?: {
    user_id: string;
  }[];
  last_message?: Message;
}

export const getUserChats = async (userId: string) => {
  // Get all chats where the user is a participant
  const { data: chatParticipants, error: participantsError } = await supabase
    .from("chat_participants")
    .select("chat_id")
    .eq("user_id", userId);

  if (participantsError) {
    console.error("Error fetching chat participants:", participantsError);
    throw participantsError;
  }

  if (!chatParticipants || chatParticipants.length === 0) {
    return [];
  }

  const chatIds = chatParticipants.map((p) => p.chat_id);

  // Get the chats with their last message
  const { data: chats, error: chatsError } = await supabase
    .from("chats")
    .select(
      `
      id,
      created_at,
      updated_at,
      chat_participants(user_id)
    `,
    )
    .in("id", chatIds);

  if (chatsError) {
    console.error("Error fetching chats:", chatsError);
    throw chatsError;
  }

  // For each chat, get the last message
  const chatsWithLastMessage = await Promise.all(
    chats.map(async (chat) => {
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select(
          `
          id,
          chat_id,
          user_id,
          content,
          read,
          created_at,
          updated_at,
          user:user_id(id, email, user_metadata)
        `,
        )
        .eq("chat_id", chat.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return chat;
      }

      return {
        ...chat,
        last_message: messages && messages.length > 0 ? messages[0] : undefined,
      };
    }),
  );

  return chatsWithLastMessage as (Chat & {
    chat_participants: { user_id: string }[];
  })[];
};

export const getChatMessages = async (chatId: string) => {
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      id,
      chat_id,
      user_id,
      content,
      read,
      created_at,
      updated_at,
      user:user_id(id, email, user_metadata)
    `,
    )
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chat messages:", error);
    throw error;
  }

  return data as Message[];
};

export const sendMessage = async (
  chatId: string,
  userId: string,
  content: string,
) => {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      user_id: userId,
      content,
    })
    .select();

  if (error) {
    console.error("Error sending message:", error);
    throw error;
  }

  return data[0] as Message;
};

export const markChatAsRead = async (chatId: string, userId: string) => {
  const { error } = await supabase
    .from("messages")
    .update({ read: true, updated_at: new Date().toISOString() })
    .eq("chat_id", chatId)
    .neq("user_id", userId)
    .eq("read", false);

  if (error) {
    console.error("Error marking chat as read:", error);
    throw error;
  }
};

export const getUnreadMessagesCount = async (userId: string) => {
  // Get all chats where the user is a participant
  const { data: chatParticipants, error: participantsError } = await supabase
    .from("chat_participants")
    .select("chat_id")
    .eq("user_id", userId);

  if (participantsError) {
    console.error("Error fetching chat participants:", participantsError);
    throw participantsError;
  }

  if (!chatParticipants || chatParticipants.length === 0) {
    return 0;
  }

  const chatIds = chatParticipants.map((p) => p.chat_id);

  // Count unread messages in these chats that were not sent by the user
  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .in("chat_id", chatIds)
    .neq("user_id", userId)
    .eq("read", false);

  if (error) {
    console.error("Error fetching unread messages count:", error);
    throw error;
  }

  return count || 0;
};

export const createChat = async (participantIds: string[]) => {
  // First create the chat
  const { data: chatData, error: chatError } = await supabase
    .from("chats")
    .insert({})
    .select();

  if (chatError) {
    console.error("Error creating chat:", chatError);
    throw chatError;
  }

  const chatId = chatData[0].id;

  // Then add all participants
  const participantsToInsert = participantIds.map((userId) => ({
    chat_id: chatId,
    user_id: userId,
  }));

  const { error: participantsError } = await supabase
    .from("chat_participants")
    .insert(participantsToInsert);

  if (participantsError) {
    console.error("Error adding chat participants:", participantsError);
    throw participantsError;
  }

  return chatId;
};
