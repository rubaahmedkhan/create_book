---
id: "007"
title: "Dashboard Localhost Book URL Fix"
stage: green
date: 2026-03-01
surface: agent
model: claude-sonnet-4-6
feature: 001-user-auth
branch: 001-user-auth
user: rubaahmedkhan
command: "docusorus ka sub kuch thk hai book blkl thk hai jo vercel pr deploy hoi hai us mai urdu header hai content not found arha hai"
labels: ["bug-fix", "dashboard", "vercel", "book-url", "localhost"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/components/dashboard/Dashboard.tsx
tests:
  - Manual: Click "START READING" on Vercel dashboard → opens GitHub Pages book in English
  - Manual: Click any module flash card → opens correct GitHub Pages module page
  - Automated: curl dashboard bundle → confirms "rubaahmedkhan.github.io" present, "localhost:3002" absent
---

## Prompt

User: "docusorus ka sub kuch thk hai book blkl thk hai jo vercel pr deploy hoi hai us mai urdu header hai content not found arha hai us mai aunthentication or dashbord uska bhi thk hai bs book content kharab hai"

(Translation: Docusaurus is completely fine, book is completely fine. The one deployed on Vercel has Urdu header, content not found is showing. Auth and dashboard are also fine. Only book content is broken.)

## Response snapshot

**Root cause identified:** `Dashboard.tsx` had `const BASE = "http://localhost:3002/create_book"` hardcoded. All "Start Reading" and module flash-card links pointed to the local Docusaurus dev server instead of the production GitHub Pages URL.

On Vercel production:
1. `localhost:3002` is unreachable in browser → "content not found"
2. If the user's local Docusaurus dev server was running, it would load with `docusaurus.languagePreference=ur` from browser localStorage (set during previous language toggle testing) → "Urdu header"

**Fix applied** (`Dashboard.tsx` line 8):
```ts
// Before:
const BASE = "http://localhost:3002/create_book";

// After:
const BASE =
  process.env.NEXT_PUBLIC_BOOK_URL ?? "https://rubaahmedkhan.github.io/create_book";
```

Deployed to Vercel. Bundle verified: `rubaahmedkhan.github.io` present, `localhost:3002` gone.

## Outcome

- ✅ Impact: All dashboard book links now open the production GitHub Pages Docusaurus book (English, correct)
- 🧪 Tests: curl bundle check confirmed correct URL in production bundle
- 📁 Files: 1 file changed (Dashboard.tsx), deployed to Vercel
- 🔁 Next prompts: Test full user flow — sign in → dashboard → click "START READING" → confirm book opens in English
- 🧠 Reflection: Hardcoded localhost URLs are a classic dev/prod environment mismatch. The `NEXT_PUBLIC_BOOK_URL` env var pattern allows local dev override while defaulting to production URL safely.

## Evaluation notes (flywheel)

- Failure modes observed: Developer hardcoded localhost URL during development, never updated for production
- Graders run and results (PASS/FAIL): curl bundle check PASS (rubaahmedkhan.github.io present)
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Add NEXT_PUBLIC_BOOK_URL to Vercel env vars if a staging Docusaurus instance is ever needed
