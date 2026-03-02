/**
 * Better Auth React Client
 *
 * Provides authentication methods for signup, signin, signout.
 * Uses Better Auth's client SDK to interact with /api/auth routes.
 */

import { createAuthClient } from "better-auth/react";

function getAuthBaseUrl(): string {
  // Explicit override (e.g. local dev pointing to separate auth-service)
  if (process.env.NEXT_PUBLIC_AUTH_URL) {
    return process.env.NEXT_PUBLIC_AUTH_URL;
  }
  // Vercel production / preview URL injected via next.config.js
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/auth`;
  }
  // Client-side: resolve relative to current origin
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/auth`;
  }
  // SSR fallback (local dev)
  return "http://localhost:3001/api/auth";
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
  fetchOptions: {
    credentials: "include",
  },
});

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string, name?: string) {
  return authClient.signUp.email({
    email,
    password,
    name: name || email.split("@")[0],
  });
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string) {
  return authClient.signIn.email({
    email,
    password,
  });
}

/**
 * Sign out the current user
 */
export async function signOut() {
  return authClient.signOut();
}

/**
 * Get the current session
 */
export async function getSession() {
  return authClient.getSession();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!(session as any)?.data?.user || !!(session as any)?.user;
}
