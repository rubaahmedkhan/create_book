# Hybrid Authentication Architecture

## Overview

This project implements a hybrid three-service architecture for user authentication with personalization:

```
Frontend (Next.js/React)
    |
    ├──→ Auth Service (Better Auth/TypeScript) ──→ Neon Postgres
    |                                                    ↑
    └──→ Backend (FastAPI/Python) ───────────────────────┘
```

## Service Responsibilities

### 1. Auth Service (TypeScript/Better Auth)
- **Port**: 3000
- **Purpose**: Handle all authentication operations
- **Endpoints**:
  - `POST /api/auth/sign-up` - Create new user account
  - `POST /api/auth/sign-in` - Authenticate existing user
  - `POST /api/auth/sign-out` - Invalidate session
  - `GET /api/auth/session` - Get current session
  - `POST /api/auth/forget-password` - Request password reset
  - `POST /api/auth/reset-password` - Reset password with token
- **Database Tables**: Manages `user`, `session`, `account`, `verification`

### 2. Backend (Python/FastAPI)
- **Port**: 8000
- **Purpose**: Handle user profiles, questionnaires, and GDPR operations
- **Endpoints**:
  - `POST /api/questionnaire` - Submit background questionnaire
  - `GET /api/questionnaire` - Get questionnaire responses
  - `GET /api/profile` - Get user profile
  - `PATCH /api/profile` - Update user profile
  - `POST /api/gdpr/export` - Request data export
  - `POST /api/gdpr/delete` - Request account deletion
- **Database Tables**: Manages `user_profile`, `questionnaire_response`, `gdpr_request`

### 3. Frontend (Next.js/React)
- **Port**: 3001
- **Purpose**: User interface for authentication and profile management
- **Pages**:
  - `/signup` - Account creation
  - `/signin` - User login
  - `/questionnaire` - Background assessment
  - `/dashboard` - Personalized home
  - `/profile` - Profile management

## Database Architecture

All services share a single **Neon Serverless Postgres** database with clear ownership boundaries:

**Better Auth Domain** (auth-service owns):
- `user` - Core authentication identity
- `session` - Active user sessions  
- `account` - OAuth providers (future)
- `verification` - Email verification tokens

**Application Domain** (backend owns):
- `user_profile` - Extended profile with skill level
- `questionnaire_response` - Background questionnaire audit trail
- `gdpr_request` - Data export/deletion requests

**Foreign Key**: `user_profile.user_id` → `user.id` links the domains

## Authentication Flow

### Signup Flow
1. User submits email/password to auth-service
2. Better Auth creates `user` and `session` records
3. Frontend receives httpOnly session cookie
4. User completes questionnaire, submitted to backend
5. Backend validates session (queries `session` table)
6. Backend creates `user_profile` and `questionnaire_response` records
7. Backend calculates skill level from responses
8. User redirected to personalized dashboard

### Signin Flow
1. User submits credentials to auth-service
2. Better Auth validates and creates new `session`
3. Frontend receives session cookie
4. Frontend calls backend `/api/profile` with cookie
5. Backend validates session and returns profile data
6. Dashboard displays personalized content based on skill level

### Session Validation (Backend)
```typescript
// Backend middleware validates sessions by querying shared database
const sessionToken = extractCookieToken(request);
const session = await db.query(
  'SELECT * FROM session WHERE token = $1 AND expiresAt > NOW()',
  [sessionToken]
);
if (!session) throw Unauthorized();
```

## Technology Stack

- **Auth Service**: TypeScript 5.x, Better Auth 1.x, Hono 3.x
- **Backend**: Python 3.11+, FastAPI 0.104+, SQLAlchemy 2.x, Alembic
- **Frontend**: React 18, Next.js 14, TypeScript 5.x
- **Database**: Neon Serverless Postgres
- **Testing**: Vitest (auth-service), pytest (backend), Jest (frontend)

## Security

- **Session Management**: 30-day httpOnly cookies with CSRF protection
- **Password Storage**: Scrypt hashing via Better Auth
- **Secrets**: All credentials in `.env` files (never hardcoded)
- **CORS**: Trusted origins configuration
- **Database**: SSL connections required (`?sslmode=require`)

## Why Hybrid Architecture?

**Problem**: Better Auth is TypeScript-only and cannot run in Python/FastAPI.

**Solution**: Separate auth-service (TypeScript) + backend (Python) sharing one database.

**Benefits**:
- Avoid reimplementing auth security features (CSRF, password hashing, session management)
- Clean separation of concerns (auth domain vs business logic)
- Database ownership (no vendor lock-in to third-party auth SaaS)
- Best tool for each job (Better Auth for auth, FastAPI for business logic)

## Development Workflow

```bash
# Terminal 1: Auth Service
cd auth-service
npm install
npm run dev  # Runs on :3000

# Terminal 2: Backend
cd backend
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000

# Terminal 3: Frontend
cd frontend
npm install
npm run dev  # Runs on :3001
```

## Environment Variables

Each service requires a `.env` file (copy from `.env.template`):

**Critical**: All three services must use the same `DATABASE_URL` to share the database.

See quickstart.md for complete setup instructions.
