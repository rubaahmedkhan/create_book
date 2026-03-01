import { betterAuth } from "better-auth";
import { Pool } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required");
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  secret: process.env.AUTH_SECRET,
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Refresh every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // MVP: no email verification
  },
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") || [],
  advanced: {
    // Allow cookies to work across different ports on localhost
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
    },
    // Use secure cookies only in production
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
