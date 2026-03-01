import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import * as dotenv from "dotenv";

dotenv.config();

const app = new Hono();

// CORS configuration
const trustedOrigins = process.env.TRUSTED_ORIGINS?.split(",") || ["http://localhost:3001"];
app.use("/*", cors({
  origin: trustedOrigins,
  credentials: true,
}));

// Better Auth routes
app.on(["GET", "POST"], "/api/auth/**", (c) => auth.handler(c.req.raw));

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok", service: "auth-service" });
});

const port = parseInt(process.env.PORT || "3000");

// Start server
console.log(`Auth service running on http://localhost:${port}`);

const serve = await import("@hono/node-server").then(m => m.serve);
serve({
  fetch: app.fetch,
  port,
});
