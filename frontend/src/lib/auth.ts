import { betterAuth } from "better-auth";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Provide WebSocket for Node.js 18 (Vercel default runtime)
neonConfig.webSocketConstructor = ws;

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL!,
  }),
  secret: process.env.AUTH_SECRET!,
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",").map(s => s.trim()).filter(Boolean) || [],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
