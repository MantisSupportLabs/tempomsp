import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log a warning instead of an error to prevent app from crashing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(
  supabaseUrl || "",
  supabaseAnonKey || "",
);
