# Better Auth Research Document

**Feature:** User Authentication System
**Date:** 2025-12-30
**Status:** Research Complete
**Target Platform:** Web Application Textbook Platform

---

## Table of Contents

1. [Better Auth Overview](#better-auth-overview)
2. [Integration Architecture](#integration-architecture)
3. [Database Configuration](#database-configuration)
4. [Session Management](#session-management)
5. [Custom User Fields](#custom-user-fields)
6. [API Patterns](#api-patterns)
7. [Security Considerations](#security-considerations)
8. [Alternatives Considered](#alternatives-considered)
9. [Implementation Recommendations](#implementation-recommendations)

---

## Better Auth Overview

### What is Better Auth?

Better Auth is a comprehensive authentication framework for TypeScript designed to be framework-agnostic and work across different platforms. It positions itself as "The most comprehensive authentication framework for TypeScript" and is part of Y Combinator's Spring 2025 batch.

### Key Characteristics

- **Framework-Agnostic**: Works with Next.js, Hono, Elysia, and other TypeScript frameworks
- **Type-Safe**: Full TypeScript support with automatic type inference
- **Plugin Ecosystem**: First-class plugin architecture for extensibility
- **Database-First**: Runs directly on your own database, not a third-party service
- **Comprehensive Features**: Built-in support for 2FA, passkeys, multi-tenancy, multi-session, SSO

### Core Features

1. **Authentication Methods**:
   - Email/Password authentication
   - OAuth providers (Google, GitHub, etc.)
   - Passkeys (WebAuthn)
   - Magic link authentication
   - Username-based login (via plugin)

2. **Security Features**:
   - CSRF protection via SameSite cookies and Origin validation
   - Scrypt password hashing (configurable to Argon2 or custom)
   - HttpOnly and secure cookies
   - Session freshness requirements for sensitive operations
   - Trusted origins configuration

3. **Advanced Capabilities**:
   - Two-factor authentication (2FA)
   - Multi-tenant user bases
   - Multi-session support
   - Enterprise SSO
   - Custom identity provider creation

### Why Better Auth Was Chosen

Better Auth was selected for this project based on several key advantages:

1. **Database Ownership**: Unlike third-party services (Auth0, Clerk), Better Auth runs directly on your database, giving you complete control over user data and avoiding vendor lock-in.

2. **Plugin Architecture**: The first-class plugin ecosystem allows easy addition of features like 2FA, passkeys, and custom authentication flows without manual integration work.

3. **TypeScript-First**: Automatic type inference across client and server reduces bugs and improves developer experience.

4. **Cost-Effective**: No per-user pricing or monthly SaaS fees; you only pay for your own infrastructure.

5. **Modern Standards**: Built with current best practices including httpOnly cookies, CSRF protection, and secure session management.

6. **Flexibility**: Framework-agnostic design means it can work with various backend architectures.

---

## Integration Architecture

### Standard TypeScript Backend Integration

Better Auth is designed primarily for TypeScript/JavaScript backends. The typical integration pattern involves:

#### 1. Installation

```bash
npm install better-auth
```

#### 2. Server-Side Setup

```typescript
import { betterAuth } from "better-auth";
import { Pool } from "@neondatabase/serverless";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },
});
```

#### 3. API Route Mounting

Better Auth provides a handler that serves all POST and GET requests. Integration patterns vary by framework:

**For Next.js** (App Router):
```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

**For Hono**:
```typescript
import { Hono } from "hono";

const app = new Hono();

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});
```

**For Elysia**:
```typescript
import { Elysia } from "elysia";

const app = new Elysia()
  .mount('/api/auth', auth.handler);
```

#### 4. Client-Side Setup

```typescript
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth"; // Server auth instance

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // Your application URL
  plugins: [
    inferAdditionalFields<typeof auth>(), // Automatic type inference
  ],
});
```

### FastAPI Integration Considerations

**Important Note**: Better Auth is a TypeScript package and does not have native Python/FastAPI support. Integration with a FastAPI backend requires one of these approaches:

#### Option 1: Separate Auth Service (Recommended)

Run Better Auth as a separate TypeScript service (e.g., with Hono or Express) and have FastAPI validate sessions:

1. **Better Auth Service**: Handles authentication flows (signup, login, password reset)
2. **FastAPI Backend**: Validates sessions by checking against the session table or using JWT tokens

```python
# FastAPI session validation example
from fastapi import Depends, HTTPException
import psycopg2

async def verify_session(session_token: str = Cookie(None)):
    if not session_token:
        raise HTTPException(status_code=401)

    # Query Better Auth session table
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT user_id FROM session WHERE token = %s AND expires_at > NOW()",
        (session_token,)
    )
    result = cursor.fetchone()

    if not result:
        raise HTTPException(status_code=401)

    return result[0]  # user_id
```

#### Option 2: JWT Plugin Method

Use Better Auth's JWT plugin and validate JWTs in FastAPI:

1. **Better Auth Config**:
```typescript
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    jwt({
      // JWT configuration
    }),
  ],
});
```

2. **FastAPI Validation**:
```python
from fastapi import Depends, HTTPException
from jose import JWTError, jwt
from typing import Optional

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401)
        return user_id
    except JWTError:
        raise HTTPException(status_code=401)
```

Better Auth provides a JWKS endpoint to get the public key for signing verification.

#### Option 3: Reverse Proxy with ForwardAuth

Use a reverse proxy (like Traefik) with ForwardAuth middleware:

1. Better Auth creates a custom endpoint that checks sessions and returns 200/401
2. Traefair forwards requests to FastAPI only if authentication succeeds
3. FastAPI receives authenticated requests with user info in headers

### Hybrid Architecture Recommendation

For a FastAPI backend with Better Auth, the recommended architecture is:

```
┌─────────────────┐
│   Frontend      │
│   (React/Vue)   │
└────────┬────────┘
         │
    ┌────┴─────────────────────┐
    │                          │
┌───▼──────────┐      ┌────────▼──────┐
│  Better Auth │      │  FastAPI      │
│  Service     │      │  Backend      │
│  (Hono/Node) │      │  (Python)     │
└───┬──────────┘      └────────┬──────┘
    │                          │
    └────────┬─────────────────┘
             │
    ┌────────▼────────┐
    │  Neon Postgres  │
    │  Database       │
    └─────────────────┘
```

**Flow**:
1. Frontend sends auth requests (signup, login, etc.) to Better Auth service
2. Better Auth manages sessions and stores them in Neon Postgres
3. Frontend sends API requests to FastAPI with session cookies
4. FastAPI validates sessions against Neon Postgres session table
5. FastAPI executes business logic and returns responses

---

## Database Configuration

### Neon Serverless Postgres Integration

Better Auth has deep integration with Neon Postgres, especially through Neon Auth which is built on top of Better Auth. Neon's serverless architecture is well-suited for authentication workloads.

#### Connection Setup

```typescript
import { betterAuth } from "better-auth";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: pool,
  // ... other configuration
});
```

#### Environment Variables

```bash
# .env file
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000" # Production: your domain
```

### Core Database Schema

Better Auth requires four essential tables that are automatically created via migration:

#### 1. User Table

```sql
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified BOOLEAN NOT NULL DEFAULT false,
  image TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Session Table

```sql
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expiresAt TIMESTAMP NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. Account Table

```sql
CREATE TABLE account (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  expiresAt TIMESTAMP,
  password TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Verification Table

```sql
CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Schema Migration

Better Auth provides automatic schema generation and migration:

```bash
# Generate schema files
npx better-auth generate

# Run migrations (auto-detects database type)
npx better-auth migrate
```

The migrate command automatically detects your PostgreSQL `search_path` configuration for non-default schemas.

### Custom Table and Column Names

You can customize table and field names:

```typescript
export const auth = betterAuth({
  database: pool,
  user: {
    modelName: "users", // Custom table name
    fields: {
      email: "email_address", // Custom column name
      emailVerified: "is_email_verified",
    },
  },
  session: {
    modelName: "sessions",
  },
});
```

### ID Generation Strategies

Better Auth supports multiple ID generation strategies:

```typescript
export const auth = betterAuth({
  advanced: {
    generateId: () => crypto.randomUUID(), // Default: UUID
  },
});
```

Options include:
- Database auto-increment (serial/auto_increment)
- UUID generation (default)
- Custom functions (e.g., nanoid, cuid2)
- Mixed ID types across different tables

### Secondary Storage for Performance

For high-performance applications, you can offload sessions and rate-limiting data to key-value stores like Redis:

```typescript
import { betterAuth } from "better-auth";
import { createRedisAdapter } from "better-auth/adapters/redis";

export const auth = betterAuth({
  database: pool, // Primary database for users/accounts
  secondaryStorage: createRedisAdapter({
    host: "localhost",
    port: 6379,
  }),
});
```

This reduces database load for frequently-accessed session data.

---

## Session Management

### Configuration for 30-Day Sessions

To implement 30-day session expiration with automatic refresh:

```typescript
export const auth = betterAuth({
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds (2,592,000)
    updateAge: 60 * 60 * 24, // Update session every 24 hours (86,400)
    freshAge: 60 * 60 * 24, // Fresh session requirement: 24 hours
  },
});
```

### Session Lifecycle

1. **Session Creation**: When user logs in, a session is created with `expiresAt = now + 30 days`
2. **Automatic Refresh**: Every time the session is used and `updateAge` (24 hours) has passed, the `expiresAt` is updated to `now + 30 days`
3. **Session Expiration**: After 30 days of inactivity, the session expires and user must re-authenticate
4. **Fresh Sessions**: Certain sensitive operations (like changing password) require the session to be less than 24 hours old

### Cookie Configuration

Better Auth manages sessions via httpOnly cookies with security best practices:

```typescript
export const auth = betterAuth({
  advanced: {
    cookiePrefix: "auth", // Cookie name: auth.session_token
    useSecureCookies: true, // Automatic in production (HTTPS)
    crossSubDomainCookies: {
      enabled: false, // Enable for cross-subdomain auth
    },
  },
});
```

**Default Cookie Attributes**:
- `httpOnly: true` - Prevents JavaScript access (XSS protection)
- `secure: true` - HTTPS-only in production
- `sameSite: "lax"` - CSRF protection
- `path: "/"` - Available across entire app

### Cookie Caching for Performance

To reduce database queries, enable cookie caching:

```typescript
export const auth = betterAuth({
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
      encoding: "compact", // Options: "compact", "jwt", "jwe"
    },
  },
});
```

**Encoding Options**:
- **compact**: Base64url-encoded, smallest size, best performance
- **jwt**: Standard JWT format, interoperable, tamper-proof
- **jwe**: Fully encrypted, highest security, largest size

### Stateless Sessions (Optional)

For completely database-free session management:

```typescript
export const auth = betterAuth({
  session: {
    stateless: true, // No database queries for sessions
  },
});
```

**Tradeoffs**:
- **Pros**: Zero database load, faster validation, no session table needed
- **Cons**: Can't revoke sessions immediately, limited to cookie size, cache invalidation requires version bumping

### Session Management API

Better Auth provides comprehensive session management functions:

#### Client-Side

```typescript
// Get current session
const { data: session } = authClient.useSession();

// List all user sessions
const { data: sessions } = authClient.listSessions();

// Revoke specific session
await authClient.revokeSession({ sessionId: "session-id" });

// Revoke all sessions
await authClient.revokeAllSessions();

// Revoke all except current
await authClient.revokeOtherSessions();
```

#### Server-Side

```typescript
import { auth } from "./auth";

// Get session from request
const session = await auth.api.getSession({
  headers: request.headers
});

// Revoke session
await auth.api.revokeSession({
  sessionId: "session-id"
});
```

### Session Freshness for Sensitive Operations

For operations like password changes, require fresh sessions:

```typescript
// In your endpoint handler
const session = await auth.api.getSession({ headers });

if (!session || !session.isFresh) {
  // Session exists but isn't fresh (older than freshAge)
  throw new Error("Please re-authenticate to perform this action");
}

// Proceed with sensitive operation
await changePassword(session.userId, newPassword);
```

### Remember Me Functionality

```typescript
// Client-side login with remember me
await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
  rememberMe: true, // Long-lived session
});

// Without remember me (session ends when browser closes)
await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
  rememberMe: false,
});
```

---

## Custom User Fields

### Extending the User Schema

Better Auth provides a type-safe way to add custom fields to the user model using `additionalFields`. This is essential for storing background questionnaire responses.

#### Server-Side Configuration

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  user: {
    additionalFields: {
      // Background questionnaire fields
      educationLevel: {
        type: "string",
        required: false,
        defaultValue: null,
        input: true, // Allow user to set during signup
      },
      priorRobotics: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: true,
      },
      programmingExperience: {
        type: "string",
        required: false,
        defaultValue: "none",
        input: true,
      },
      learningGoals: {
        type: "string",
        required: false,
        defaultValue: null,
        input: true,
      },
      institutionName: {
        type: "string",
        required: false,
        defaultValue: null,
        input: true,
      },
      country: {
        type: "string",
        required: false,
        defaultValue: null,
        input: true,
      },
      preferredLanguage: {
        type: "string",
        required: false,
        defaultValue: "en",
        input: true,
      },
      // Administrative fields
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: false, // Don't allow user to set role (security)
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
      lastLoginAt: {
        type: "date",
        required: false,
        defaultValue: null,
        input: false,
      },
    },
  },
});
```

#### Field Configuration Options

Each additional field supports:

- **type**: `"string" | "number" | "boolean" | "date"`
- **required**: Whether field is required (defaults to `false`)
- **defaultValue**: Default value for the field
- **input**: Whether field can be set by user during signup (defaults to `true`)
  - Set to `false` for admin-only fields like `role` or `isActive`

#### Client-Side Type Inference

Better Auth automatically infers types on the client:

```typescript
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth"; // Server instance

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(), // Auto-infers custom fields
  ],
});
```

#### Using Custom Fields in Signup

```typescript
// Client-side signup with custom fields
await authClient.signUp.email({
  name: "John Doe",
  email: "john@example.com",
  password: "securePassword123",
  // Custom fields from background questionnaire
  educationLevel: "undergraduate",
  priorRobotics: true,
  programmingExperience: "intermediate",
  learningGoals: "Build autonomous robots",
  institutionName: "MIT",
  country: "USA",
  preferredLanguage: "en",
});
```

#### Accessing Custom Fields

```typescript
// In React component
const { data: session } = authClient.useSession();

if (session) {
  console.log(session.user.educationLevel);
  console.log(session.user.priorRobotics);
  console.log(session.user.role); // Set by server, not user
}
```

#### Updating Custom Fields

Create a custom endpoint to update user profile:

```typescript
// Server-side custom endpoint
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  // ... configuration
});

// Custom endpoint for updating profile
auth.api.registerEndpoint({
  method: "POST",
  path: "/user/update-profile",
  handler: async ({ body, session }) => {
    if (!session) {
      throw new Error("Unauthorized");
    }

    // Update allowed fields only
    const allowedFields = [
      "educationLevel",
      "priorRobotics",
      "programmingExperience",
      "learningGoals",
      "institutionName",
      "country",
      "preferredLanguage",
    ];

    const updates = Object.keys(body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: body[key] }), {});

    await auth.database.update("user", {
      where: { id: session.userId },
      data: updates,
    });

    return { success: true };
  },
});
```

#### Database Schema for Custom Fields

When you run migrations, Better Auth automatically adds custom fields to the user table:

```sql
-- Generated migration
ALTER TABLE user
ADD COLUMN education_level TEXT,
ADD COLUMN prior_robotics BOOLEAN DEFAULT false,
ADD COLUMN programming_experience TEXT DEFAULT 'none',
ADD COLUMN learning_goals TEXT,
ADD COLUMN institution_name TEXT,
ADD COLUMN country TEXT,
ADD COLUMN preferred_language TEXT DEFAULT 'en',
ADD COLUMN role TEXT DEFAULT 'student',
ADD COLUMN is_active BOOLEAN DEFAULT true,
ADD COLUMN last_login_at TIMESTAMP;
```

#### Using Plugins for Complex Extensions

For more complex user data, consider creating a plugin:

```typescript
import { createAuthPlugin } from "better-auth/plugins";

const questionnairePlugin = createAuthPlugin({
  id: "questionnaire",
  schema: {
    user: {
      fields: {
        questionnaireCompleted: {
          type: "boolean",
          required: false,
          defaultValue: false,
        },
        questionnaireCompletedAt: {
          type: "date",
          required: false,
        },
      },
    },
  },
  endpoints: {
    completeQuestionnaire: {
      method: "POST",
      handler: async ({ body, session, db }) => {
        // Custom logic for questionnaire completion
        await db.update("user", {
          where: { id: session.userId },
          data: {
            questionnaireCompleted: true,
            questionnaireCompletedAt: new Date(),
            ...body, // Questionnaire responses
          },
        });
      },
    },
  },
});

export const auth = betterAuth({
  plugins: [questionnairePlugin],
});
```

---

## API Patterns

### Core API Architecture

Better Auth is built on top of **better-call**, a lightweight web framework that allows calling REST API endpoints as if they were regular functions. This enables seamless type inference from server to client.

### Built-in API Endpoints

Better Auth automatically provides the following endpoints when mounted at `/api/auth`:

#### Authentication Endpoints

**Sign Up**
- **Endpoint**: `POST /api/auth/sign-up/email`
- **Body**: `{ name, email, password, image?, callbackURL?, ...customFields }`
- **Response**: `{ user, session }`

**Sign In**
- **Endpoint**: `POST /api/auth/sign-in/email`
- **Body**: `{ email, password, rememberMe? }`
- **Response**: `{ user, session }`

**Sign Out**
- **Endpoint**: `POST /api/auth/sign-out`
- **Headers**: `Cookie: session_token`
- **Response**: `{ success: true }`

#### Session Endpoints

**Get Session**
- **Endpoint**: `GET /api/auth/get-session`
- **Headers**: `Cookie: session_token`
- **Response**: `{ user, session } | null`

**List Sessions**
- **Endpoint**: `GET /api/auth/list-sessions`
- **Headers**: `Cookie: session_token`
- **Response**: `{ sessions: Session[] }`

**Revoke Session**
- **Endpoint**: `POST /api/auth/revoke-session`
- **Body**: `{ sessionId }`
- **Response**: `{ success: true }`

**Revoke All Sessions**
- **Endpoint**: `POST /api/auth/revoke-all-sessions`
- **Headers**: `Cookie: session_token`
- **Response**: `{ success: true }`

**Revoke Other Sessions**
- **Endpoint**: `POST /api/auth/revoke-other-sessions`
- **Headers**: `Cookie: session_token`
- **Response**: `{ success: true }`

#### Email Verification Endpoints

**Send Verification Email**
- **Endpoint**: `POST /api/auth/send-verification-email`
- **Body**: `{ email, callbackURL? }`
- **Response**: `{ success: true }`

**Verify Email**
- **Endpoint**: `GET /api/auth/verify-email`
- **Query**: `?token=<verification-token>`
- **Response**: Redirect or JSON response

#### Password Reset Endpoints

**Request Password Reset**
- **Endpoint**: `POST /api/auth/forget-password`
- **Body**: `{ email, redirectTo? }`
- **Response**: `{ success: true }`

**Reset Password**
- **Endpoint**: `POST /api/auth/reset-password`
- **Body**: `{ password, token }`
- **Response**: `{ user, session }`

**Change Password**
- **Endpoint**: `POST /api/auth/change-password`
- **Body**: `{ newPassword, currentPassword, revokeOtherSessions? }`
- **Headers**: `Cookie: session_token`
- **Response**: `{ success: true }`

#### Account Management Endpoints

**Update User**
- **Endpoint**: `POST /api/auth/update-user`
- **Body**: `{ name?, image? }`
- **Headers**: `Cookie: session_token`
- **Response**: `{ user }`

**Delete User**
- **Endpoint**: `POST /api/auth/delete-user`
- **Headers**: `Cookie: session_token`
- **Response**: `{ success: true }`

### Client SDK Usage

Better Auth provides a type-safe client SDK that calls these endpoints:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
});

// Sign up
await authClient.signUp.email({
  name: "John Doe",
  email: "john@example.com",
  password: "securePassword123",
});

// Sign in
await authClient.signIn.email({
  email: "john@example.com",
  password: "securePassword123",
  rememberMe: true,
});

// Get session (React hook)
const { data: session, isPending } = authClient.useSession();

// Sign out
await authClient.signOut();

// Change password
await authClient.changePassword({
  newPassword: "newSecurePassword456",
  currentPassword: "securePassword123",
  revokeOtherSessions: true,
});
```

### Server-Side API Usage

To call API endpoints on the server:

```typescript
import { auth } from "./auth";

// Get session from request
const session = await auth.api.getSession({
  headers: request.headers,
});

// Create user programmatically
const user = await auth.api.signUp.email({
  body: {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password123",
  },
});

// Revoke session
await auth.api.revokeSession({
  body: { sessionId: "session-id" },
});
```

**Note**: Server calls require passing values as an object with `body`, `headers`, and `query` keys.

### Creating Custom Endpoints

You can extend Better Auth with custom endpoints:

```typescript
import { betterAuth } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";

export const auth = betterAuth({
  // ... configuration
});

// Custom endpoint for admin operations
const adminEndpoint = createAuthEndpoint({
  method: "POST",
  path: "/admin/deactivate-user",
  handler: async ({ body, session, db }) => {
    // Check if user is admin
    const user = await db.findUnique("user", {
      where: { id: session.userId }
    });

    if (user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Deactivate user
    await db.update("user", {
      where: { id: body.userId },
      data: { isActive: false },
    });

    return { success: true };
  },
});

// Register endpoint
auth.api.registerEndpoint(adminEndpoint);
```

### Request/Response Format Patterns

#### Standard Request Format

```typescript
{
  headers: {
    "Content-Type": "application/json",
    "Cookie": "auth.session_token=<token>",
  },
  body: {
    // Endpoint-specific data
  },
  query: {
    // URL parameters
  }
}
```

#### Standard Response Format

**Success**:
```typescript
{
  user?: {
    id: string,
    email: string,
    name: string,
    emailVerified: boolean,
    image?: string,
    createdAt: Date,
    updatedAt: Date,
    // ... custom fields
  },
  session?: {
    id: string,
    userId: string,
    token: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string,
  },
  success?: boolean,
}
```

**Error**:
```typescript
{
  error: string,
  message: string,
  statusCode: number,
}
```

### Error Handling Patterns

```typescript
// Client-side error handling
try {
  await authClient.signIn.email({
    email: "user@example.com",
    password: "wrongpassword",
  });
} catch (error) {
  if (error.statusCode === 401) {
    console.error("Invalid credentials");
  } else if (error.statusCode === 429) {
    console.error("Too many attempts, please try again later");
  } else {
    console.error("An error occurred:", error.message);
  }
}
```

### Rate Limiting

Better Auth supports rate limiting out of the box:

```typescript
export const auth = betterAuth({
  rateLimit: {
    enabled: true,
    window: 60, // 60 seconds
    max: 10, // 10 requests per window
    storage: "memory", // or "database" or custom storage
  },
});
```

---

## Security Considerations

### CSRF Protection

Better Auth implements multiple layers of CSRF protection:

#### 1. SameSite Cookie Attribute

Session cookies use `SameSite=Lax` by default, preventing browsers from sending cookies with most cross-site requests. This blocks the most common CSRF attack vectors.

```typescript
// Automatic in Better Auth
// Cookies are set with: SameSite=Lax
```

#### 2. Origin Header Validation

Better Auth validates the `Origin` header on all state-changing requests (POST, PUT, DELETE). Requests from untrusted origins are automatically blocked.

```typescript
export const auth = betterAuth({
  trustedOrigins: [
    "https://yourdomain.com",
    "https://app.yourdomain.com",
  ],
});
```

**Important**: In production, set `trustedOrigins` to your application domains. Requests from origins not on this list are rejected.

#### 3. GET Request Protections

GET requests are assumed to be read-only. In cases where a GET request must perform a mutation (e.g., OAuth callbacks), Better Auth applies extra security measures:

- Validates nonce parameters
- Validates state parameters
- Ensures request authenticity through cryptographic verification

### Password Security

#### Password Hashing

Better Auth uses **scrypt** for password hashing by default, a memory-hard key derivation function resistant to brute-force attacks.

**Default Configuration**:
```typescript
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => {
        // Scrypt hashing (default)
        return await scrypt.hash(password);
      },
      verify: async (password, hash) => {
        return await scrypt.verify(password, hash);
      },
    },
  },
});
```

#### Custom Password Hashing (Argon2)

For even stronger security, you can use Argon2:

```typescript
import { hash, verify } from "@node-rs/argon2";

export const auth = betterAuth({
  emailAndPassword: {
    password: {
      hash: async (password) => {
        return await hash(password, {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        });
      },
      verify: async (password, hash) => {
        return await verify(hash, password);
      },
    },
  },
});
```

#### Password Requirements

```typescript
export const auth = betterAuth({
  emailAndPassword: {
    minPasswordLength: 12, // Recommended: 12+ characters
    maxPasswordLength: 128,
    // Add custom validation in your signup form:
    // - At least one uppercase letter
    // - At least one lowercase letter
    // - At least one number
    // - At least one special character
  },
});
```

### HttpOnly and Secure Cookies

Better Auth automatically sets secure cookie attributes:

**Production (HTTPS)**:
- `httpOnly: true` - Prevents JavaScript access (XSS protection)
- `secure: true` - HTTPS-only transmission
- `sameSite: "lax"` - CSRF protection

**Development (HTTP)**:
- `httpOnly: true`
- `secure: false` (allows HTTP for local development)
- `sameSite: "lax"`

```typescript
// Automatic based on environment
// In production with HTTPS: secure=true
// In development with HTTP: secure=false

export const auth = betterAuth({
  advanced: {
    useSecureCookies: true, // Auto-enabled in production
  },
});
```

### Session Security

#### Session Token Generation

Better Auth generates cryptographically secure session tokens:

```typescript
// Automatic - uses crypto.randomBytes or Web Crypto API
// Tokens are sufficiently long and random to prevent guessing
```

#### Session Storage

- **Database Storage**: Sessions stored in database table with indexed token column
- **Encrypted Cookies**: When using stateless sessions, cookies are encrypted with JWE
- **Signed Cookies**: All cookies are signed using the `BETTER_AUTH_SECRET`

#### Session Freshness

Require recent authentication for sensitive operations:

```typescript
export const auth = betterAuth({
  session: {
    freshAge: 60 * 60 * 24, // 24 hours
  },
});

// In sensitive endpoint
if (!session.isFresh) {
  throw new Error("Please re-authenticate");
}
```

### Email Verification

Protect against account takeover by requiring email verification:

```typescript
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendVerificationEmail: async ({ user, token, url }) => {
      // Send email with verification link
      await emailService.send({
        to: user.email,
        subject: "Verify your email",
        html: `Click here to verify: ${url}?token=${token}`,
      });
    },
  },
});
```

**Security Considerations**:
- Verification tokens expire (default: 1 hour)
- Tokens are single-use
- Don't await email sending to prevent timing attacks:
  ```typescript
  sendVerificationEmail: async (data) => {
    emailService.send(data); // Don't await
  }
  ```

### Rate Limiting

Protect against brute-force attacks and abuse:

```typescript
export const auth = betterAuth({
  rateLimit: {
    enabled: true,
    window: 60, // 60 seconds
    max: 10, // 10 requests per window
    storage: "database", // Recommended for multi-instance deployments
  },
});
```

**Custom Rate Limits per Endpoint**:
```typescript
const loginEndpoint = createAuthEndpoint({
  method: "POST",
  path: "/sign-in/email",
  rateLimit: {
    window: 60,
    max: 5, // Stricter limit for login attempts
  },
  handler: async ({ body }) => {
    // Login logic
  },
});
```

### SQL Injection Protection

Better Auth uses parameterized queries and ORM adapters (Drizzle, Prisma) that protect against SQL injection by default.

**If writing raw queries**, always use parameterized queries:

```typescript
// GOOD: Parameterized query
db.query("SELECT * FROM user WHERE email = $1", [email]);

// BAD: String interpolation (SQL injection risk)
db.query(`SELECT * FROM user WHERE email = '${email}'`);
```

### XSS Protection

Better Auth helps prevent XSS attacks through:

1. **HttpOnly Cookies**: Session tokens stored in httpOnly cookies can't be accessed by JavaScript
2. **Content Security Policy**: Implement CSP headers in your application
3. **Output Encoding**: Always encode user data before rendering in HTML

### Environment Variables Security

**Never commit secrets to version control**:

```bash
# .env file (add to .gitignore)
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="at-least-32-characters-long-random-string"
```

**Generate secure secrets**:
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### HTTPS in Production

**Always use HTTPS in production**:

```typescript
export const auth = betterAuth({
  baseURL: "https://yourdomain.com", // HTTPS only
  advanced: {
    useSecureCookies: true, // Enforces HTTPS
  },
});
```

### Security Headers

Implement security headers in your application:

```typescript
// Next.js middleware example
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}
```

### Audit Logging

Track security-relevant events:

```typescript
// Custom plugin for audit logging
const auditLogPlugin = createAuthPlugin({
  id: "audit-log",
  hooks: {
    after: [
      {
        matcher: (context) => context.path.includes("sign-in"),
        handler: async (context) => {
          await db.insert("audit_log", {
            userId: context.session?.userId,
            action: "login",
            ipAddress: context.request.headers.get("x-forwarded-for"),
            userAgent: context.request.headers.get("user-agent"),
            timestamp: new Date(),
          });
        },
      },
    ],
  },
});
```

### Account Lockout

Implement account lockout after failed login attempts:

```typescript
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Custom login endpoint with lockout logic
const loginWithLockout = createAuthEndpoint({
  method: "POST",
  path: "/sign-in/email",
  handler: async ({ body, db }) => {
    const user = await db.findUnique("user", {
      where: { email: body.email }
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if account is locked
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      throw new Error("Account temporarily locked");
    }

    // Verify password
    const isValid = await verifyPassword(body.password, user.password);

    if (!isValid) {
      // Increment failed attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;

      await db.update("user", {
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockoutUntil: failedAttempts >= MAX_FAILED_ATTEMPTS
            ? new Date(Date.now() + LOCKOUT_DURATION)
            : null,
        },
      });

      throw new Error("Invalid credentials");
    }

    // Reset failed attempts on successful login
    await db.update("user", {
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockoutUntil: null },
    });

    // Create session and return
    return await createSession(user);
  },
});
```

---

## Alternatives Considered

### 1. Auth.js (NextAuth.js)

**Pros**:
- Mature and widely adopted
- Extensive provider support (Google, GitHub, etc.)
- Active community and documentation
- Built-in database adapters

**Cons**:
- No formal plugin architecture
- Credentials provider forces JWT strategy (no database persistence by default)
- MFA not built-in (requires custom implementation)
- Access token rotation must be handled manually
- More configuration complexity for advanced features

**Why Better Auth Was Chosen Over Auth.js**:
- Better Auth has a first-class plugin ecosystem, making features like 2FA and passkeys trivial to add
- Better Auth provides better TypeScript inference across client and server
- Better Auth has more modern architecture designed for current web standards
- If migrating from NextAuth, there's a migration guide available

### 2. Supabase Auth

**Pros**:
- Tight integration with Supabase ecosystem
- Leverages PostgreSQL Row-Level Security (RLS)
- Built-in OAuth providers
- Hosted authentication service
- Real-time subscriptions

**Cons**:
- Vendor lock-in to Supabase platform
- Less flexibility for custom authentication flows
- Requires using Supabase client libraries
- Cost scales with usage (per monthly active user)
- Less control over authentication logic

**Why Better Auth Was Chosen Over Supabase Auth**:
- Better Auth runs on your own database (no vendor lock-in)
- More flexibility for custom authentication requirements
- Can use any PostgreSQL database (including Neon without Supabase)
- No per-user pricing or usage-based costs
- Better Auth is database-agnostic (can switch databases if needed)

### 3. Clerk

**Pros**:
- Beautiful pre-built UI components
- Excellent developer experience
- Hosted authentication service
- Built-in user management dashboard
- Advanced features like organizations and RBAC

**Cons**:
- Expensive at scale ($25/month + $0.02 per MAU)
- Vendor lock-in to Clerk platform
- Limited customization of authentication flows
- All user data stored on Clerk's servers
- Overkill for simple authentication needs

**Why Better Auth Was Chosen Over Clerk**:
- No monthly fees or per-user charges
- Complete data ownership and control
- Better for educational platform where costs must scale linearly
- Sufficient features for the use case without complexity of organizations/teams

### 4. Auth0

**Pros**:
- Enterprise-grade authentication
- Extensive protocol support (SAML, OIDC, WS-Fed)
- Advanced security features
- Comprehensive audit logging
- Global CDN and high availability

**Cons**:
- Very expensive (starts at $35/month, scales to hundreds/thousands)
- Complex configuration and setup
- Overkill for most applications
- Vendor lock-in
- Steep learning curve

**Why Better Auth Was Chosen Over Auth0**:
- Cost: Auth0 is prohibitively expensive for an educational platform
- Complexity: Auth0's enterprise features are unnecessary for this use case
- Control: Better Auth gives direct database access and full customization

### 5. Passport.js

**Pros**:
- Very flexible and customizable
- Large ecosystem of strategies (500+)
- Works with any Node.js framework
- Long-standing and battle-tested

**Cons**:
- Requires significant manual configuration
- No built-in session management
- No TypeScript-first design
- Requires integrating separate libraries for features like 2FA
- More boilerplate code required

**Why Better Auth Was Chosen Over Passport.js**:
- Better Auth provides everything out of the box (session management, 2FA, etc.)
- Better TypeScript support and type inference
- Less boilerplate and manual configuration
- Modern API design vs. Passport's older middleware patterns

### 6. Firebase Authentication

**Pros**:
- Easy to set up and use
- Tight integration with Firebase ecosystem
- Hosted authentication service
- Good mobile SDK support
- Built-in email/phone verification

**Cons**:
- Vendor lock-in to Google/Firebase
- Limited customization options
- All user data stored on Firebase
- Less control over authentication flows
- Pricing can become expensive at scale

**Why Better Auth Was Chosen Over Firebase Auth**:
- Database ownership and control
- Better integration with existing PostgreSQL infrastructure
- No vendor lock-in
- More customization flexibility for educational platform needs

### Decision Matrix

| Feature | Better Auth | Auth.js | Supabase | Clerk | Auth0 | Passport |
|---------|-------------|---------|----------|-------|-------|----------|
| **Cost** | Free | Free | $25/mo | $25/mo + usage | $35+/mo | Free |
| **Database Control** | Full | Full | Limited | None | None | Full |
| **TypeScript Support** | Excellent | Good | Good | Excellent | Fair | Fair |
| **Plugin Architecture** | Yes | No | Limited | No | No | Yes |
| **Setup Complexity** | Low | Medium | Low | Low | High | High |
| **Customization** | High | Medium | Medium | Low | High | Very High |
| **2FA Built-in** | Yes (plugin) | No | Yes | Yes | Yes | No |
| **Passkeys Support** | Yes (plugin) | No | No | Yes | Yes | No |
| **Session Management** | Built-in | Built-in | Built-in | Built-in | Built-in | Manual |
| **Vendor Lock-in** | None | None | High | High | High | None |

### Final Decision

**Better Auth** was chosen because it offers:

1. **Zero vendor lock-in**: Runs on our own Neon Postgres database
2. **Cost-effective**: No per-user charges or monthly SaaS fees
3. **Modern architecture**: TypeScript-first with excellent type inference
4. **Plugin ecosystem**: Easy to add features like 2FA, passkeys, multi-session
5. **Full control**: Direct database access and customizable authentication flows
6. **Security**: Built-in CSRF protection, httpOnly cookies, secure session management
7. **Flexibility**: Framework-agnostic design works with our hybrid FastAPI/TypeScript architecture
8. **Developer experience**: Clean API, good documentation, active development

For an educational textbook platform that needs user authentication with custom profile fields, Better Auth provides the best balance of features, cost, flexibility, and developer experience.

---

## Implementation Recommendations

### Phase 1: Core Authentication Setup

1. **Set up Neon Postgres database**
   - Create Neon project
   - Configure connection string in environment variables
   - Enable connection pooling for serverless

2. **Initialize Better Auth**
   - Install `better-auth` and `@neondatabase/serverless`
   - Create auth instance with basic email/password configuration
   - Run database migrations to create auth tables

3. **Implement authentication endpoints**
   - Mount Better Auth handler to `/api/auth/*`
   - Test signup, login, logout flows
   - Implement email verification

4. **Set up client SDK**
   - Initialize auth client with type inference
   - Create authentication UI components (login, signup forms)
   - Implement protected routes

### Phase 2: Custom User Fields

1. **Define background questionnaire schema**
   - Add `additionalFields` to user model
   - Include education level, programming experience, learning goals, etc.
   - Set appropriate `input` flags for security

2. **Extend signup flow**
   - Update signup form to collect questionnaire data
   - Validate inputs on client and server
   - Store responses in user table

3. **Create profile management**
   - Build user profile page
   - Allow users to update questionnaire responses
   - Implement server-side validation

### Phase 3: Session Management

1. **Configure 30-day sessions**
   - Set `expiresIn: 60 * 60 * 24 * 30`
   - Set `updateAge: 60 * 60 * 24` for automatic refresh
   - Enable cookie caching for performance

2. **Implement remember me functionality**
   - Add remember me checkbox to login form
   - Configure session duration based on user choice

3. **Add session management UI**
   - Display active sessions to users
   - Allow users to revoke individual sessions
   - Show last login time and device info

### Phase 4: Security Hardening

1. **Enable CSRF protection**
   - Configure trusted origins for production domains
   - Test cross-origin request blocking

2. **Implement rate limiting**
   - Enable rate limiting on auth endpoints
   - Configure stricter limits for login attempts
   - Consider Redis for distributed rate limiting

3. **Add email verification**
   - Configure email service (Resend, SendGrid, etc.)
   - Implement verification email template
   - Require email verification before login

4. **Implement password reset flow**
   - Create forgot password page
   - Configure password reset email
   - Create reset password page
   - Test full flow

### Phase 5: FastAPI Integration

1. **Set up hybrid architecture**
   - Deploy Better Auth service (Hono or Express)
   - Configure FastAPI to validate sessions
   - Share Neon Postgres database

2. **Create session validation middleware**
   - FastAPI middleware to check session cookies
   - Query Neon session table for validation
   - Attach user info to request context

3. **Test end-to-end flow**
   - Authenticate via Better Auth
   - Make API calls to FastAPI with session
   - Verify user context in FastAPI endpoints

### Phase 6: Advanced Features (Optional)

1. **Add two-factor authentication**
   - Enable 2FA plugin in Better Auth
   - Create 2FA setup flow
   - Add backup codes

2. **Implement social OAuth**
   - Add OAuth plugins (Google, GitHub)
   - Configure OAuth providers
   - Test social login flows

3. **Add audit logging**
   - Create audit log table
   - Log security-relevant events (login, password change, etc.)
   - Create admin dashboard for audit logs

### Recommended Project Structure

```
project/
├── auth-service/              # Better Auth TypeScript service
│   ├── src/
│   │   ├── auth.ts           # Better Auth configuration
│   │   ├── index.ts          # Server entry point (Hono/Express)
│   │   └── plugins/          # Custom auth plugins
│   ├── package.json
│   └── .env
│
├── backend/                   # FastAPI backend
│   ├── main.py
│   ├── middleware/
│   │   └── auth.py           # Session validation middleware
│   ├── routers/
│   └── requirements.txt
│
├── frontend/                  # React/Next.js frontend
│   ├── src/
│   │   ├── lib/
│   │   │   └── auth.ts       # Auth client configuration
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── ProfileForm.tsx
│   │   └── pages/
│   ├── package.json
│   └── .env.local
│
└── shared/
    ├── types/                 # Shared TypeScript types
    └── schemas/               # Validation schemas
```

### Environment Variables Setup

```bash
# Shared across all services
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"

# Auth service
BETTER_AUTH_SECRET="min-32-char-random-string"
BETTER_AUTH_URL="https://yourdomain.com"
EMAIL_FROM="noreply@yourdomain.com"
RESEND_API_KEY="re_xxxxx" # or other email provider

# Frontend
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_AUTH_URL="https://yourdomain.com/api/auth"

# Backend (FastAPI)
BACKEND_URL="https://api.yourdomain.com"
CORS_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"
```

### Testing Strategy

1. **Unit Tests**
   - Test auth configuration
   - Test custom endpoints
   - Test validation logic

2. **Integration Tests**
   - Test full signup flow
   - Test login/logout flows
   - Test password reset flow
   - Test session validation across services

3. **E2E Tests**
   - Test user journeys (signup → login → use app → logout)
   - Test error scenarios (invalid credentials, expired sessions)
   - Test security features (CSRF, rate limiting)

### Deployment Considerations

1. **Database**
   - Use Neon Postgres with connection pooling
   - Enable auto-scaling for compute
   - Set up database backups

2. **Auth Service**
   - Deploy to Vercel, Railway, or similar
   - Enable HTTPS
   - Configure environment variables
   - Set up monitoring and logging

3. **FastAPI Backend**
   - Deploy to cloud provider (AWS, GCP, Railway)
   - Configure session validation middleware
   - Set up CORS correctly

4. **Frontend**
   - Deploy to Vercel or Netlify
   - Configure environment variables
   - Enable HTTPS

### Performance Optimization

1. **Enable cookie caching**
   - Reduces database queries for session validation
   - Use `compact` encoding for smallest cookie size

2. **Use connection pooling**
   - Neon Serverless driver includes pooling
   - Configure pool size based on load

3. **Consider Redis for sessions** (optional)
   - Offload session storage to Redis
   - Reduces database load
   - Faster session lookups

4. **Implement CDN caching**
   - Cache static auth pages
   - Use CDN for faster global access

---

## Sources

- [Better Auth Official Website](https://www.better-auth.com/)
- [Better Auth GitHub Repository](https://github.com/better-auth/better-auth)
- [Better Auth Documentation - Introduction](https://www.better-auth.com/docs/introduction)
- [Better Auth Documentation - Database](https://www.better-auth.com/docs/concepts/database)
- [Better Auth Documentation - TypeScript](https://www.better-auth.com/docs/concepts/typescript)
- [Better Auth Documentation - User & Accounts](https://www.better-auth.com/docs/concepts/users-accounts)
- [Better Auth Documentation - Session Management](https://www.better-auth.com/docs/concepts/session-management)
- [Better Auth Documentation - Email & Password](https://www.better-auth.com/docs/authentication/email-password)
- [Better Auth Documentation - Security](https://www.better-auth.com/docs/reference/security)
- [Better Auth Documentation - Cookies](https://www.better-auth.com/docs/concepts/cookies)
- [Better Auth Documentation - API](https://www.better-auth.com/docs/concepts/api)
- [Better Auth Documentation - Plugins](https://www.better-auth.com/docs/concepts/plugins)
- [Better Auth - Y Combinator](https://www.ycombinator.com/companies/better-auth)
- [LogRocket - Is Better Auth the key to solving authentication headaches?](https://blog.logrocket.com/better-auth-authentication/)
- [BrightCoding - Simplify Authentication with Better Auth](https://www.blog.brightcoding.dev/2025/05/12/simplify-authentication-with-this-amazing-typescript-library-better-auth/)
- [Neon Serverless Postgres](https://neon.com/)
- [Neon Docs - Serverless Driver](https://neon.com/docs/serverless/serverless-driver)
- [Better Stack - Better Auth vs NextAuth vs Auth0](https://betterstack.com/community/guides/scaling-nodejs/better-auth-vs-nextauth-authjs-vs-autho/)
- [DevTools Academy - BetterAuth vs NextAuth](https://www.devtoolsacademy.com/blog/betterauth-vs-nextauth/)
- [Medium - Authentication in Next.js: NextAuth vs. Clerk vs. Supabase](https://medium.com/@annasaaddev/authentication-in-next-js-the-ultimate-2024-guide-nextauth-vs-clerk-vs-supabase-415ff7d841c5)
- [Hyperknot - Comparing Auth Providers](https://blog.hyperknot.com/p/comparing-auth-providers)
- [Better Auth Migration Guide - Auth.js to Better Auth](https://www.better-auth.com/docs/guides/next-auth-migration-guide)
- [DEV Community - Forgot and Reset Password using Better Auth](https://dev.to/daanish2003/forgot-and-reset-password-using-betterauth-nextjs-and-resend-ilj)
- [Better Stack - Authentication and Authorization with FastAPI](https://betterstack.com/community/guides/scaling-python/authentication-fastapi/)
- [AnswerOverflow - Better Auth with Different Backend (FastAPI)](https://www.answeroverflow.com/m/1404248316824518656)

---

**Document Prepared By**: Claude Code
**Last Updated**: 2025-12-30
