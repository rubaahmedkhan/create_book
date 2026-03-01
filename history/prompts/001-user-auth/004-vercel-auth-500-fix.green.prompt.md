---
id: "004"
title: "Vercel Auth 500 Fix TRUSTED_ORIGINS"
stage: green
date: 2026-03-01
surface: agent
model: claude-sonnet-4-6
feature: 001-user-auth
branch: main
user: rubaahmedkhan
command: "vercel wala thk kren"
labels: ["bug-fix", "better-auth", "vercel", "trusted-origins", "environment-variables"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/lib/auth.ts
  - frontend/src/app/api/auth/[...all]/route.ts
  - frontend/src/app/api/questionnaire/route.ts
  - frontend/src/app/api/profile/route.ts
  - frontend/src/lib/db.ts
  - frontend/src/lib/skillCalculator.ts
  - frontend/src/services/authClient.ts
  - frontend/src/services/api.ts
  - frontend/next.config.js
  - frontend/src/app/layout.tsx
tests:
  - Manual: POST /api/auth/sign-up/email → 200 with user+token
  - Manual: POST /api/auth/sign-in/email → 200 with session+token
  - Manual: GET /api/auth/get-session → 200 with session+user details
---

## Prompt

User: "vercel wala thk kren ye docusorus ka thk hai" (Fix the Vercel one, Docusaurus is fixed)

## Response snapshot

The Vercel frontend at `https://frontend-chi-fawn-17.vercel.app` had a 500 Internal Server Error on all auth endpoints (`/api/auth/sign-up/email`, `/api/auth/sign-in/email`).

**Diagnosis process:**
1. Database connection test: PASSED (both Pool/WebSocket and neon/HTTP work on Vercel)
2. Auth module initialization: PASSED (auth object created correctly)
3. Auth handler simulation (test route): PASSED (signup returns 200)
4. Direct curl to `/api/auth/sign-up/email`: FAILED (500 empty response)

**Root Cause:** `TRUSTED_ORIGINS` environment variable in Vercel had a trailing `\n` character. Better Auth silently crashes (empty 500) when it tries to parse an invalid URL from the trusted origins list. The value was `"https://frontend-chi-fawn-17.vercel.app\n"` instead of `"https://frontend-chi-fawn-17.vercel.app"`.

**Fix applied:**
1. Removed and re-added `TRUSTED_ORIGINS` in Vercel without trailing newline
2. Added `.trim().filter(Boolean)` to origin parsing in `auth.ts`
3. Changed auth route to explicit `GET`/`POST` handlers calling `auth.handler(req)`
4. Deployed all new API routes: `/api/auth/[...all]`, `/api/questionnaire`, `/api/profile`

**Final verification:**
- Signup: ✓ Creates user, returns token
- Signin: ✓ Returns session + user
- Get Session: ✓ Returns valid session (expires 30 days)

## Outcome

- ✅ Impact: Full auth flow works on Vercel — signup, signin, session management
- 🧪 Tests: curl-based E2E tests for all 3 auth operations
- 📁 Files: 10 frontend files committed to git + deployed via Vercel CLI
- 🔁 Next prompts: Test full browser flow (signup with questionnaire → dashboard)
- 🧠 Reflection: The TRUSTED_ORIGINS trailing `\n` issue is a common environment variable problem. Better Auth fails silently with no error body when origin validation fails at handler level. Always use `.trim()` when parsing comma-separated env vars. Use Vercel CLI for deployment since the project isn't git-integrated with Vercel auto-deploy.
