import { supabase } from "./supabase";

// Company types
export interface Company {
  id: string;
  name: string;
  website?: string;
  phone?: string;
}

export interface Location {
  id: string;
  companyId: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
}

// Client types
export interface Client {
  id: string;
  userId: string;
  companyId: string;
  locationId?: string;
  jobTitle?: string;
  phone?: string;
  user?: {
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  company?: Company;
  location?: Location;
}

// Technician types
export interface Technician {
  id: string;
  userId: string;
  specialization?: string;
  phone?: string;
  user?: {
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
}

// Ticket types
export type TicketType = "support" | "hardware" | "software";
export type TicketStatus = "pending" | "in-progress" | "complete";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export interface Ticket {
  id: string;
  clientId: string;
  technicianId?: string;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority?: TicketPriority;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  technician?: Technician;
}

// Chat types
export type ChatStatus = "active" | "waiting" | "closed";

export interface Chat {
  id: string;
  ticketId: string;
  subject: string;
  status: ChatStatus;
  lastActivity: string;
  ticket?: Ticket;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  message: string;
  read: boolean;
  createdAt: string;
  sender?: {
    fullName: string;
    avatarUrl?: string;
  };
}

// API functions for companies
export async function getCompanies() {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name");

  if (error) {
    throw error;
  }

  return data as Company[];
}

export async function getCompanyLocations(companyId: string) {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("company_id", companyId)
    .order("name");

  if (error) {
    throw error;
  }

  return data.map((location) => ({
    id: location.id,
    companyId: location.company_id,
    name: location.name,
    address: location.address,
    city: location.city,
    state: location.state,
    zip: location.zip,
    phone: location.phone,
  })) as Location[];
}

// API functions for clients
export async function getClients() {
  const { data, error } = await supabase.from("clients").select(`
      *,
      user:users(id, email, full_name, avatar_url),
      company:companies(id, name, website, phone),
      location:locations(id, name, address, city, state, zip, phone)
    `);

  if (error) {
    throw error;
  }

  return data.map((client) => ({
    id: client.id,
    userId: client.user_id,
    companyId: client.company_id,
    locationId: client.location_id,
    jobTitle: client.job_title,
    phone: client.phone,
    user: client.user
      ? {
          fullName: client.user.full_name,
          email: client.user.email,
          avatarUrl: client.user.avatar_url,
        }
      : undefined,
    company: client.company
      ? {
          id: client.company.id,
          name: client.company.name,
          website: client.company.website,
          phone: client.company.phone,
        }
      : undefined,
    location: client.location
      ? {
          id: client.location.id,
          companyId: client.company_id,
          name: client.location.name,
          address: client.location.address,
          city: client.location.city,
          state: client.location.state,
          zip: client.location.zip,
          phone: client.location.phone,
        }
      : undefined,
  })) as Client[];
}

// API functions for technicians
export async function getTechnicians() {
  const { data, error } = await supabase.from("technicians").select(`
      *,
      user:users(id, email, full_name, avatar_url)
    `);

  if (error) {
    throw error;
  }

  return data.map((tech) => ({
    id: tech.id,
    userId: tech.user_id,
    specialization: tech.specialization,
    phone: tech.phone,
    user: tech.user
      ? {
          fullName: tech.user.full_name,
          email: tech.user.email,
          avatarUrl: tech.user.avatar_url,
        }
      : undefined,
  })) as Technician[];
}

// API functions for tickets
export async function getTickets(clientId?: string) {
  let query = supabase
    .from("tickets")
    .select(
      `
      *,
      client:clients(
        id, 
        user:users(id, email, full_name, avatar_url),
        company:companies(id, name)
      ),
      technician:technicians(
        id,
        user:users(id, email, full_name, avatar_url)
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data.map((ticket) => ({
    id: ticket.id,
    clientId: ticket.client_id,
    technicianId: ticket.technician_id,
    title: ticket.title,
    description: ticket.description,
    type: ticket.type,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    client: ticket.client
      ? {
          id: ticket.client.id,
          user: ticket.client.user
            ? {
                fullName: ticket.client.user.full_name,
                email: ticket.client.user.email,
                avatarUrl: ticket.client.user.avatar_url,
              }
            : undefined,
          company: ticket.client.company
            ? {
                id: ticket.client.company.id,
                name: ticket.client.company.name,
              }
            : undefined,
        }
      : undefined,
    technician: ticket.technician
      ? {
          id: ticket.technician.id,
          user: ticket.technician.user
            ? {
                fullName: ticket.technician.user.full_name,
                email: ticket.technician.user.email,
                avatarUrl: ticket.technician.user.avatar_url,
              }
            : undefined,
        }
      : undefined,
  })) as Ticket[];
}

export async function createTicket(
  ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt">,
) {
  const { data, error } = await supabase
    .from("tickets")
    .insert({
      client_id: ticket.clientId,
      technician_id: ticket.technicianId,
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      status: ticket.status,
      priority: ticket.priority,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
) {
  const { data, error } = await supabase
    .from("tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", ticketId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// API functions for chats
export async function getChats(technicianId?: string) {
  let query = supabase
    .from("chats")
    .select(
      `
      *,
      ticket:tickets(
        id, 
        title, 
        client_id,
        client:clients(
          id,
          user:users(id, email, full_name, avatar_url),
          company:companies(id, name)
        )
      )
    `,
    )
    .order("last_activity", { ascending: false });

  if (technicianId) {
    query = query.eq("ticket.technician_id", technicianId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data.map((chat) => ({
    id: chat.id,
    ticketId: chat.ticket_id,
    subject: chat.subject,
    status: chat.status,
    lastActivity: chat.last_activity,
    ticket:
      chat.ticket && chat.ticket[0]
        ? {
            id: chat.ticket[0].id,
            title: chat.ticket[0].title,
            clientId: chat.ticket[0].client_id,
            client:
              chat.ticket[0].client && chat.ticket[0].client[0]
                ? {
                    id: chat.ticket[0].client[0].id,
                    user: chat.ticket[0].client[0].user
                      ? {
                          fullName: chat.ticket[0].client[0].user.full_name,
                          email: chat.ticket[0].client[0].user.email,
                          avatarUrl: chat.ticket[0].client[0].user.avatar_url,
                        }
                      : undefined,
                    company: chat.ticket[0].client[0].company
                      ? {
                          id: chat.ticket[0].client[0].company.id,
                          name: chat.ticket[0].client[0].company.name,
                        }
                      : undefined,
                  }
                : undefined,
          }
        : undefined,
  })) as Chat[];
}

export async function getMessages(chatId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:users(id, full_name, avatar_url)
    `,
    )
    .eq("chat_id", chatId)
    .order("created_at");

  if (error) {
    throw error;
  }

  return data.map((message) => ({
    id: message.id,
    chatId: message.chat_id,
    senderId: message.user_id,
    message: message.content,
    read: message.read,
    createdAt: message.created_at,
    sender:
      message.sender && message.sender[0]
        ? {
            fullName: message.sender[0].full_name,
            avatarUrl: message.sender[0].avatar_url,
          }
        : undefined,
  })) as Message[];
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  message: string,
) {
  // Insert the message
  const { data: messageData, error: messageError } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      user_id: senderId,
      content: message,
    })
    .select()
    .single();

  if (messageError) {
    throw messageError;
  }

  // Update the chat's last activity
  const { error: chatError } = await supabase
    .from("chats")
    .update({
      last_activity: new Date().toISOString(),
      status: "active",
    })
    .eq("id", chatId);

  if (chatError) {
    throw chatError;
  }

  return messageData;
}

export async function markMessagesAsRead(chatId: string, userId: string) {
  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("chat_id", chatId)
    .neq("user_id", userId)
    .eq("read", false);

  if (error) {
    throw error;
  }
}
