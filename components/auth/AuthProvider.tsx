"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import type { UserProfile, UserRole } from "@/types/auth";

type AuthState = {
  isConfigured: boolean;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

function getMetadataRole(user: User | null): UserRole | null {
  const role =
    user?.app_metadata?.role ??
    user?.user_metadata?.role ??
    user?.user_metadata?.user_role;

  if (
    role === "admin" ||
    role === "architect" ||
    role === "client" ||
    role === "viewer"
  ) {
    return role;
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const user = session?.user ?? null;

  async function loadProfile(nextUser: User | null) {
    if (!isSupabaseConfigured || !supabase || !nextUser) {
      setProfile(null);
      return;
    }

    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", nextUser.id)
      .maybeSingle<UserProfile>();

    setProfile(data ?? null);
  }

  async function refreshProfile() {
    await loadProfile(user);
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setSession(null);
    setProfile(null);
  }

  useEffect(() => {
    let active = true;

    async function initialize() {
      if (!isSupabaseConfigured || !supabase) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      setSession(data.session);
      await loadProfile(data.session?.user ?? null);
      setIsLoading(false);
    }

    void initialize();

    if (!isSupabaseConfigured || !supabase) {
      return () => {
        active = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void loadProfile(nextSession?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthState = {
    isConfigured: isSupabaseConfigured,
    isLoading,
    session,
    user,
    profile,
    role: profile?.role ?? getMetadataRole(user),
    refreshProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
