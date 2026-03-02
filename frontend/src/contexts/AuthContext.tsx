"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSession, signOut as authSignOut } from "@/services/authClient";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = async () => {
    try {
      const result = await getSession();
      console.log("[AuthContext] Session result:", result);

      // Better Auth returns { data: { session, user }, error }
      const userData = result?.data?.user;

      if (userData) {
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
        });
        console.log("[AuthContext] User set:", userData.email);
      } else {
        console.log("[AuthContext] No user data found");
        setUser(null);
      }
    } catch (error) {
      console.error("[AuthContext] Failed to load session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const signOut = async () => {
    try {
      await authSignOut();
      setUser(null);
      window.location.href = "/signin";
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const refreshSession = async () => {
    setLoading(true);
    await loadSession();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
