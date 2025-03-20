import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { getCurrentUser, getUserProfile, UserProfile } from "../lib/auth";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadUserProfile = async (userId: string) => {
    try {
      const userProfile = await getUserProfile(userId);
      setProfile(userProfile);
    } catch (err) {
      console.error("Error loading user profile:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to load user profile"),
      );
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);

        // Get current session
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          try {
            await loadUserProfile(currentUser.id);
          } catch (profileErr) {
            console.warn("Could not load profile, but continuing:", profileErr);
          }
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to initialize auth"),
        );
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, error, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
