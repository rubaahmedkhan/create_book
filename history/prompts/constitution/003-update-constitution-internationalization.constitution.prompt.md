---
id: 003
title: Update Constitution with Internationalization Principle
stage: constitution
date: 2025-12-30
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-rag-chatbot-integration
user: user
command: /sp.constitution read translate.md file and update constitution file use all best practice
labels: ["constitution", "internationalization", "i18n", "urdu-translation", "accessibility", "rtl-support"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - Manual validation of constitution structure
  - Verification of sync impact report completeness
  - Validation of i18n best practices inclusion
---

## Prompt

/sp.constitution read translate.md file and update constitution file use all best practice

## Response snapshot

Successfully updated the Physical AI & Humanoid Robotics Textbook Constitution (version 1.1.0 → 1.2.0) with a comprehensive new principle for internationalization and multilingual accessibility:

**Principle X: Internationalization and Multilingual Accessibility**
- Establishes requirement to support multiple languages (Urdu, Arabic, Chinese, Spanish, French) to maximize global accessibility
- Mandates chapter-level language selection buttons/dropdowns as requested in translate.md
- Specifies comprehensive RTL (right-to-left) support for Urdu and Arabic languages
- Defines translation quality standards including technical accuracy, cultural context, and SME review requirements
- Provides concrete Docusaurus i18n configuration example with locale settings
- Establishes CI/CD validation for translation completeness and RTL layout
- Specifies what must be translated vs. excluded (code syntax, commands, brand names, acronyms)
- Requires community translation contribution support with guidelines and review process

The principle addresses the user's request from translate.md to "translate the content in Urdu in the chapters by pressing a button at the start of each chapter" by:
1. Requiring prominent language selection UI at chapter start
2. Configuring Urdu (ur) as a primary target language with RTL support
3. Establishing translation workflow and quality standards
4. Ensuring technical accuracy is maintained across all languages

The update includes:
- Comprehensive sync impact report identifying affected templates and Docusaurus configuration
- 7 follow-up TODOs for i18n plugin configuration, translation workflow, RTL CSS, and CI/CD validation
- Version increment from 1.1.0 to 1.2.0 (minor version bump - new principle added)
- Updated amendment date to 2025-12-30
- Updated repository structure to include i18n/ directory with language subdirectories
- Updated testing requirements to include translation completeness and RTL validation

**Best Practices Incorporated**:
- Docusaurus i18n plugin usage (industry standard for documentation sites)
- Proper RTL text direction handling with CSS mirroring for UI components
- Translation completeness validation in CI/CD pipeline
- Separation of translatable content from code/commands/technical identifiers
- Subject matter expert review requirement to maintain technical accuracy
- Community contribution support with proper attribution
- Cultural context consideration (units, examples, analogies)
- Localization of visual assets with embedded text

## Outcome

- ✅ Impact: Added comprehensive internationalization principle that transforms the textbook from English-only to globally accessible multilingual education resource, directly addressing the translate.md requirement for Urdu translation buttons
- 🧪 Tests: Manual validation passed - all placeholders filled, structure maintained, sync report complete, best practices from Docusaurus i18n and MDN Web Docs incorporated
- 📁 Files: Modified .specify/memory/constitution.md (added ~67 lines for Principle X, updated repository structure, testing requirements, and version metadata)
- 🔁 Next prompts:
  1. Configure Docusaurus i18n plugin in docusaurus.config.js for all target locales
  2. Implement language selection button/dropdown component in Docusaurus theme
  3. Create translation guidelines document for community contributors
  4. Add RTL CSS support for Urdu and Arabic layouts
  5. Set up CI/CD validation for translation completeness
  6. Create .env.template for translation service credentials (if using machine translation API)
- 🧠 Reflection: The translate.md file contained a simple user request ("translate the content in Urdu in the chapters by pressing a button") that represents a significant architectural requirement. By elevating this to a constitutional principle, we ensure systematic implementation across all modules with proper quality standards, RTL support, and community contribution infrastructure. The principle balances accessibility goals with technical accuracy requirements - critical for educational content where mistranslation could compromise learning outcomes.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution update completed successfully with comprehensive i18n best practices
- Graders run and results (PASS/FAIL): PASS - sync impact report complete, version incremented correctly (1.1.0→1.2.0 minor bump), all placeholders resolved, best practices incorporated (Docusaurus i18n, RTL support, translation workflow, quality standards)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Implement automated translation completeness checker in CI/CD that compares source file counts with translated file counts per locale and flags missing/outdated translations
