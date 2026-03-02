---
id: 006
title: Vercel Full System Deployment - Next.js API Routes
stage: green
date: 2026-03-01
surface: agent
model: claude-sonnet-4-6
feature: 001-user-auth
branch: 001-user-auth
user: rubaahmedkhan
command: continue from context summary
labels: ["deployment", "vercel", "nextjs", "better-auth", "neon", "api-routes"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/package.json
  - frontend/src/lib/auth.ts
  - frontend/src/lib/db.ts
  - frontend/src/lib/skillCalculator.ts
  - frontend/src/app/api/auth/[...all]/route.ts
  - frontend/src/app/api/questionnaire/route.ts
  - frontend/src/app/api/profile/route.ts
  - frontend/src/services/authClient.ts
  - frontend/src/services/api.ts
  - frontend/next.config.js
  - frontend/.gitignore
tests:
  - TypeScript compile check (npx tsc --noEmit) — PASS
---

## Prompt

(Continued from previous session) Deploy the full system publicly on Vercel for free — consolidate auth-service (Better Auth/Hono) and FastAPI backend into Next.js API routes so everything lives in one Vercel project. No credit card, no Railway/Render.

## Response snapshot

Created Next.js API routes replacing separate auth-service and FastAPI backend:

1. Added `@neondatabase/serverless` and `ws` to `frontend/package.json`
2. Created `frontend/src/lib/auth.ts` — Better Auth server config using Neon Pool with WebSocket support (ws)
3. Created `frontend/src/lib/db.ts` — lazy Neon SQL client (HTTP transport) to avoid build-time errors
4. Created `frontend/src/lib/skillCalculator.ts` — ported Python skill scoring algorithm to TypeScript
5. Created `frontend/src/app/api/auth/[...all]/route.ts` — Better Auth handler via `toNextJsHandler`
6. Created `frontend/src/app/api/questionnaire/route.ts` — POST with skill calculation + Neon UPSERT
7. Created `frontend/src/app/api/profile/route.ts` — GET profile by session user_id
8. Updated `authClient.ts` — smart absolute URL detection (NEXT_PUBLIC_AUTH_URL → NEXT_PUBLIC_VERCEL_URL → window.location.origin → localhost fallback)
9. Updated `api.ts` — baseURL falls back to `/api` (internal routes)
10. Fixed `next.config.js` — correct `experimental.serverComponentsExternalPackages` for Next.js 14; expose `VERCEL_PROJECT_PRODUCTION_URL` as `NEXT_PUBLIC_VERCEL_URL`
11. Added `force-dynamic` to all API routes to prevent build-time execution
12. Set Vercel env vars: DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_AUTH_URL, TRUSTED_ORIGINS
13. Successfully deployed to `https://frontend-chi-fawn-17.vercel.app`

Issues resolved during deployment:
- `serverExternalPackages` invalid in Next.js 14 → changed to `experimental.serverComponentsExternalPackages`
- `neon()` called at module level → made lazy with `getSql()` getter
- Better Auth client required absolute URL during SSR pre-rendering → added `NEXT_PUBLIC_AUTH_URL` and `NEXT_PUBLIC_VERCEL_URL` fallbacks

## Outcome

- ✅ Impact: Full system (auth + profile + questionnaire APIs) live on Vercel free tier at https://frontend-chi-fawn-17.vercel.app — no credit card required
- 🧪 Tests: TypeScript compile passes; Vercel build succeeds with all 8 routes (3 dynamic API + 5 static pages)
- 📁 Files: 10 files created/modified in frontend/
- 🔁 Next prompts: Test signup/signin flow end-to-end; add OPENROUTER_API_KEY for chatbot
- 🧠 Reflection: Better Auth client requires absolute URL even during client-component SSR pre-rendering — must handle via env vars or window.location.origin fallback

## Evaluation notes (flywheel)

- Failure modes observed: (1) relative URL in Better Auth client during SSR, (2) neon() module-level init before env vars available, (3) Next.js 14 vs 15 config key mismatch
- Graders run and results (PASS/FAIL): tsc --noEmit PASS; vercel build PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): add OPENROUTER_API_KEY to Vercel and proxy chatbot requests through /api/chat route
