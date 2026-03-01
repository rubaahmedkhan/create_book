# Quickstart Guide: User Authentication with Personalization

**Feature**: 001-user-auth
**Target Audience**: Developers setting up the authentication system locally
**Prerequisites**: Node.js 18+, Python 3.11+, Docker (optional for Postgres)

---

## Overview

This feature implements a hybrid authentication architecture:

- **auth-service** (TypeScript/Better Auth): Handles signup, signin, session management
- **backend** (Python/FastAPI): Handles user profiles, questionnaires, GDPR operations
- **frontend** (React/TypeScript): User interface for authentication and profile management

All services share a single **Neon Serverless Postgres** database.

---

## Quick Setup (5 Minutes)

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd book1

# Install all service dependencies
cd auth-service && npm install && cd ..
cd backend && pip install -r requirements.txt && cd ..
cd frontend && npm install && cd ..
```

### 2. Database Setup

**Option A: Use Neon Serverless Postgres (Recommended)**

```bash
# Sign up at neon.tech
# Create a new project: "textbook-platform"
# Copy connection string from dashboard
```

**Option B: Local Postgres with Docker**

```bash
docker run --name auth-db -e POSTGRES_PASSWORD=devpassword -p 5432:5432 -d postgres:15
```

### 3. Environment Configuration

**auth-service/.env**

```env
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Better Auth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET=your-random-secret-here

# Server Config
PORT=3000
NODE_ENV=development

# Trusted Origins (for CSRF protection)
TRUSTED_ORIGINS=http://localhost:3001
```

**backend/.env**

```env
# Database (same as auth-service)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Server Config
PORT=8000
ENVIRONMENT=development

# Auth Service URL (for session validation)
AUTH_SERVICE_URL=http://localhost:3000
```

**frontend/.env**

```env
# API Endpoints
NEXT_PUBLIC_AUTH_URL=http://localhost:3000/api/auth
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 4. Run Database Migrations

```bash
# Better Auth tables (user, session, account, verification)
cd auth-service
npx better-auth migrate
cd ..

# Application tables (user_profile, questionnaire_response, gdpr_request)
cd backend
alembic upgrade head
cd ..
```

### 5. Start Services

**Terminal 1: Auth Service**

```bash
cd auth-service
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2: Backend**

```bash
cd backend
uvicorn src.main:app --reload --port 8000
# Runs on http://localhost:8000
```

**Terminal 3: Frontend**

```bash
cd frontend
npm run dev
# Runs on http://localhost:3001
```

---

## Verify Setup

### 1. Health Checks

```bash
# Auth service health
curl http://localhost:3000/health

# Backend health
curl http://localhost:8000/health
```

### 2. Test Signup Flow

**Step 1: Create Account**

```bash
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecureP@ss123",
    "name": "Test User"
  }' \
  -c cookies.txt
```

Expected: 201 Created, session cookie in `cookies.txt`

**Step 2: Submit Questionnaire**

```bash
curl -X POST http://localhost:8000/api/questionnaire \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "software_background": {
      "experience_years": 3,
      "programming_languages": ["Python", "JavaScript"],
      "python_proficiency": "intermediate",
      "cpp_proficiency": "basic",
      "ros_exposure": false
    },
    "hardware_background": {
      "experience_level": "hobbyist",
      "robotics_hardware": ["Arduino"],
      "sensor_integration_exp": true,
      "robot_deployment_exp": false
    },
    "aiml_background": {
      "ml_frameworks": ["TensorFlow"],
      "computer_vision_exp": true,
      "llm_familiarity": "intermediate"
    },
    "learning_goals": {
      "career_objectives": "Learn robotics",
      "robotics_domains_interest": ["Autonomous Vehicles"],
      "learning_pace": "structured"
    }
  }'
```

Expected: 201 Created, user profile with `skillLevel: "intermediate"`

**Step 3: Get Profile**

```bash
curl http://localhost:8000/api/profile \
  -b cookies.txt
```

Expected: 200 OK, complete user profile JSON

---

## Database Schema Verification

```sql
-- Check Better Auth tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('user', 'session', 'account', 'verification');

-- Check application tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('user_profile', 'questionnaire_response', 'gdpr_request');

-- Verify foreign key relationship
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'user_profile';
```

Expected: `user_profile.user_id` references `user.id`

---

## Development Workflow

### Running Tests

**Auth Service (Vitest)**

```bash
cd auth-service
npm test
```

**Backend (Pytest)**

```bash
cd backend
pytest tests/
```

**Frontend (React Testing Library)**

```bash
cd frontend
npm test
```

### Code Quality

```bash
# TypeScript type checking (auth-service, frontend)
npm run type-check

# Python type checking (backend)
mypy src/

# Linting
npm run lint         # TypeScript
ruff check src/      # Python
```

### Database Operations

**Reset Database (Development Only)**

```bash
# Drop and recreate all tables
cd backend
alembic downgrade base
cd ../auth-service
npx better-auth migrate

# Re-run migrations
cd ../backend
alembic upgrade head
```

**Add New Migration (Backend)**

```bash
cd backend
alembic revision --autogenerate -m "Add new field to user_profile"
alembic upgrade head
```

---

## Architecture Flow Diagrams

### User Signup Flow

```
User (Browser)
    |
    | POST /sign-up (email, password)
    v
Auth Service (Better Auth)
    |
    | INSERT user, session
    v
Neon Postgres
    |
    | Set-Cookie: session token
    v
Frontend
    |
    | Redirect to questionnaire
    v
User completes questionnaire
    |
    | POST /questionnaire (background data)
    v
Backend (FastAPI)
    |
    | Validate session token from cookie
    | Query session table
    v
Neon Postgres
    |
    | Session valid?
    v
Backend
    |
    | INSERT user_profile, questionnaire_response
    | Calculate skill_level
    v
Neon Postgres
    |
    | Return profile with skill_level
    v
Frontend
    |
    | Redirect to personalized dashboard
    v
User
```

### Session Validation Flow (Backend)

```
Frontend Request (with session cookie)
    |
    | Cookie: better-auth.session=<token>
    v
Backend FastAPI Middleware
    |
    | Extract session token from cookie
    v
Query Shared Database
    |
    | SELECT * FROM session
    | WHERE token = ? AND expiresAt > now()
    v
Session Valid?
    |
    ├─ Yes: Attach user_id to request context
    |        Allow request to proceed
    |
    └─ No:  Return 401 Unauthorized
```

---

## Common Issues & Solutions

### Issue: "Better Auth tables not found"

**Solution**: Run Better Auth migration

```bash
cd auth-service
npx better-auth migrate
```

### Issue: "Connection refused" errors

**Solution**: Check all services are running

```bash
lsof -i :3000  # Auth service
lsof -i :8000  # Backend
lsof -i :3001  # Frontend
```

### Issue: "CORS errors" in browser console

**Solution**: Verify `TRUSTED_ORIGINS` in auth-service/.env includes frontend URL

```env
TRUSTED_ORIGINS=http://localhost:3001,http://localhost:3000
```

### Issue: "Session validation failed" in backend

**Solution**: Ensure both services use the same `DATABASE_URL`

```bash
# Check auth-service/.env and backend/.env have matching DATABASE_URL
cat auth-service/.env | grep DATABASE_URL
cat backend/.env | grep DATABASE_URL
```

### Issue: "Weak password" error

**Solution**: Passwords must meet requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special symbol

### Issue: Skill level always "beginner"

**Solution**: Check questionnaire submission includes sufficient experience data.
Skill calculator algorithm:

```python
# Beginner: < 2 years software OR no programming languages
# Intermediate: 2-5 years AND 2+ languages
# Advanced: 5+ years AND ROS experience OR professional hardware
```

---

## Environment Variables Reference

### auth-service/.env

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | Neon Postgres connection string | `postgresql://...` |
| `AUTH_SECRET` | Yes | Session signing secret (32+ chars) | `openssl rand -base64 32` |
| `PORT` | No | Auth service port (default: 3000) | `3000` |
| `NODE_ENV` | No | Environment mode | `development` / `production` |
| `TRUSTED_ORIGINS` | Yes | CORS allowed origins (comma-separated) | `http://localhost:3001` |

### backend/.env

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | Neon Postgres connection string (same as auth-service) | `postgresql://...` |
| `PORT` | No | Backend port (default: 8000) | `8000` |
| `ENVIRONMENT` | No | Environment mode | `development` / `production` |
| `AUTH_SERVICE_URL` | No | Auth service URL for health checks | `http://localhost:3000` |

### frontend/.env

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_AUTH_URL` | Yes | Auth service API base URL | `http://localhost:3000/api/auth` |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL | `http://localhost:8000/api` |

---

## Security Checklist

Before deploying to production, ensure:

- [ ] `AUTH_SECRET` is cryptographically random (32+ bytes)
- [ ] `DATABASE_URL` uses SSL (`?sslmode=require`)
- [ ] `.env` files are in `.gitignore`
- [ ] `.env.template` files provided with placeholders (no secrets)
- [ ] `TRUSTED_ORIGINS` limited to production domains only
- [ ] Session cookies use `Secure` flag (HTTPS only)
- [ ] Password requirements enforced (min 8 chars, complexity)
- [ ] Rate limiting enabled on auth endpoints
- [ ] GDPR deletion scheduled jobs configured
- [ ] Database backups automated (Neon provides this)

---

## Next Steps

1. ✅ Complete local setup using this guide
2. Run all test suites (`npm test`, `pytest`)
3. Review `/sp.tasks` output for implementation task breakdown
4. Start with foundational tasks (database setup, auth service configuration)
5. Implement user stories in priority order:
   - P1: Signup + Questionnaire (MVP)
   - P2: Signin
   - P3: Profile Management
6. Deploy to staging environment
7. Run E2E tests and security audit
8. Deploy to production

---

## Support & Resources

- **Better Auth Docs**: https://better-auth.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Neon Docs**: https://neon.tech/docs
- **Alembic Docs**: https://alembic.sqlalchemy.org
- **Project Constitution**: `.specify/memory/constitution.md` (Principle XI)
- **Feature Spec**: `specs/001-user-auth/spec.md`
- **Data Model**: `specs/001-user-auth/data-model.md`
- **API Contracts**: `specs/001-user-auth/contracts/`
