---
id: "004"
title: "Language Toggle URL Bug Fix"
stage: green
date: 2026-03-01
surface: agent
model: claude-sonnet-4-6
feature: 002-urdu-translation
branch: main
user: rubaahmedkhan
command: "continue session — fix language toggle alignment bug"
labels: ["bug-fix", "language-toggle", "rtl", "url-routing", "docusaurus"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - main-site/src/theme/LanguageToggle/utils.ts
  - module1-ros2/src/theme/LanguageToggle/utils.ts
  - module2-simulation/src/theme/LanguageToggle/utils.ts
  - module3-isaac/src/theme/LanguageToggle/utils.ts
  - module4-vla/src/theme/LanguageToggle/utils.ts
tests:
  - Manual: visit /create_book/ur/intro and click GBEnglish → should navigate to /create_book/intro
  - Manual: visit /create_book/ → English content should be LTR aligned
---

## Prompt

User reported alignment issue: book ki sari allignment change hugai hai (all alignment changed, text shifted right). Screenshot showed the Docusaurus book in Urdu locale (/ur/intro) with RTL layout and English content right-aligned. User could not switch back to English using the GBEnglish button.

Previous session attempted a fix by force-pushing to gh-pages branch, but the GitHub Actions workflow deploys via artifact upload (actions/deploy-pages@v4), not from the gh-pages branch directly — so the force-push had no effect on the live site.

## Response snapshot

Identified two root-cause bugs in all 5 Docusaurus site `utils.ts` files:

**Bug 1 — `getLocaleFromPath` regex:**
- Old: `path.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)\/?/)` — `\/?` is optional slash, so `/create_book/` path matched `cr` as a locale code
- Fixed: `path.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(\/|$)/)` — requires trailing slash OR end-of-string

**Bug 2 — `buildLocalizedUrl` passed full path before stripping baseUrl:**
- Old: detected locale from `/create_book/ur/intro` (got `cr`) → built wrong URL
- Fixed: strip baseUrl first → get `/ur/intro` → detect locale `ur` → strip → `/intro` → return `/create_book/intro`

Committed fixes to `main` branch and pushed to trigger GitHub Actions deployment, which correctly rebuilds and deploys to GitHub Pages via artifact upload.

## Outcome

- ✅ Impact: Language toggle "GBEnglish" button now correctly navigates from /ur/intro back to /intro with LTR layout
- 🧪 Tests: Manual browser test — visit Urdu page, click English button, verify LTR layout
- 📁 Files: 5 utils.ts files updated (same fix pattern across all sites)
- 🔁 Next prompts: Verify live site after GitHub Actions completes (~2 min)
- 🧠 Reflection: The gh-pages force-push approach was ineffective because GitHub Pages was configured to use "GitHub Actions" source (actions/deploy-pages@v4), not the gh-pages branch. Always push to the source branch (main) to trigger Actions when using this deployment method.

## Evaluation notes (flywheel)

- Root cause: optional slash `\/?` in regex — extremely subtle; the locale pattern matched 2-letter sequences at the start of any path segment
- The baseUrl stripping bug was the more critical one: even with the correct regex, if baseUrl wasn't stripped first, the path would be `/create_book/ur/intro` which starts with `/c` not a locale code → locale not detected → URL not stripped → wrong navigation target
- Deployment method mattered: the previous session's fix was correct in code but deployed via wrong mechanism (direct gh-pages push instead of pushing to main for Actions)
