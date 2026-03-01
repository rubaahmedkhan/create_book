/**
 * Better Auth React Client
 *
 * Provides authentication methods for signup, signin, signout.
 * Uses Better Auth's client SDK to interact with auth-service.
 */

import { createAuthClient } from "better-auth/react";

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000/api/auth";

export const authClient = createAuthClient({
  baseURL: authUrl,
  fetchOptions: {
    credentials: "include", // Important: Include cookies in cross-origin requests
  },
});

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string, name?: string) {
  return authClient.signUp.email({
    email,
    password,
    name: name || email.split("@")[0], // Default name to email prefix
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
  return !!session?.user;
}
