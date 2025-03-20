import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "technician" | "client";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole,
) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw authError;
  }

  if (authData.user) {
    // Create user profile
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role,
    });

    if (profileError) {
      throw profileError;
    }
  }

  return authData;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
  // Clear any local storage items that might be causing login issues
  localStorage.removeItem("supabase.auth.token");
  return true;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.warn("Error fetching user profile:", error);
      return null;
    }

    if (!data) {
      console.warn("No user profile found for ID:", userId);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      role: data.role as UserRole,
    };
  } catch (err) {
    console.error("Exception in getUserProfile:", err);
    return null;
  }
}
