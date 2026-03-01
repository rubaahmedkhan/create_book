---
id: 002
title: Urdu Translation Implementation Planning
stage: plan
date: 2025-12-30
surface: agent
model: claude-sonnet-4-5-20250929
feature: 002-urdu-translation
branch: 002-urdu-translation
user: user
command: /sp.plan
labels: ["plan", "urdu-translation", "docusaurus-i18n", "rtl-layout", "architecture"]
links:
  spec: specs/002-urdu-translation/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-urdu-translation/plan.md
  - specs/002-urdu-translation/research.md
  - specs/002-urdu-translation/data-model.md
  - specs/002-urdu-translation/quickstart.md
  - specs/002-urdu-translation/contracts/language-toggle-component.interface.ts
tests:
  - Constitution check validation (all gates passed)
  - Technical context completeness verification
  - Architectural decision documentation
---

## Prompt

/sp.plan

## Response snapshot

Successfully created comprehensive implementation plan for Urdu translation feature including research findings, data models, API contracts, and quickstart guide.

**Planning Artifacts Created**:

### 1. Implementation Plan (plan.md)
- **Summary**: Enable Urdu translation with chapter-level language toggle using Docusaurus i18n plugin, RTL layout support, and localStorage persistence
- **Technical Context**: JavaScript/React 18, Docusaurus v3.9+, multi-instance monorepo, browser storage, Playwright testing
- **Constitution Check**: ✅ All gates passed (Principles I, VI, X, Technical Infrastructure)
- **Project Structure**: Detailed file tree for 5 Docusaurus instances + shared components
- **Phase 0 Research**: 5 key topics + 3 unknowns requiring clarification
- **Phase 1 Design**: Data models, API contracts, quickstart guide
- **Phase 2 Strategy**: 5 architectural decisions, 3-phase implementation, risk mitigation, testing strategy
- **Success Metrics**: 8 measurable outcomes for validation

**Key Architectural Decisions**:
1. **Shared Component**: `LanguageToggle` in shared/ workspace (consistency across instances)
2. **Toggle Placement**: Inline at chapter start + navbar dropdown (meets constitutional requirement)
3. **RTL Implementation**: CSS direction properties (native browser support, performant)
4. **Translation Structure**: Docusaurus i18n standard (`i18n/ur/docusaurus-plugin-content-docs/current/`)
5. **Fallback Strategy**: File-level (Docusaurus automatic fallback for untranslated content)

### 2. Research Document (research.md)
Comprehensive research findings on 8 key topics:
- **Docusaurus i18n Configuration**: RTL locale config pattern with code examples
- **Multi-Instance Setup**: Independent configs per instance, shared components via workspace
- **Translation File Structure**: Docusaurus convention with detailed directory tree
- **RTL Layout**: CSS direction with unicode-bidi for code block preservation
- **Language Persistence**: localStorage (Docusaurus convention) with privacy mode fallback
- **Theme Swizzling**: "Wrap" mode for DocItem (safe upgrades, minimal code)
- **URL Parameters**: Support `?lang=ur` with redirect to `/ur/` paths
- **Translation Workflow**: File-level fallback, 3-phase translation process

**Decision Summary Table**: 8 decisions with rationale and alternatives considered

### 3. Data Model (data-model.md)
4 primary entities with complete schemas:
- **LanguagePreference** (localStorage): locale, direction, timestamp, displayMode
- **TranslationMetadata** (file-based): source/translated paths, dates, translator credits, review status, completeness
- **LocaleConfig** (static config): code, label, direction, htmlLang, flag
- **TranslationStatus** (runtime state): available, completeness, lastUpdated, isOutdated, warning

**Data Flow Diagrams**: Language selection flow, translation status check flow
**Storage Considerations**: localStorage (5-10MB), file-based (1-5KB for 40 chapters)
**Relationships**: Entity relationships and referential integrity constraints

### 4. API Contracts (contracts/language-toggle-component.interface.ts)
TypeScript interfaces for:
- **LanguageToggleProps**: Component props with currentLocale, availableLocales, onLanguageChange, displayMode, position
- **LocaleConfig**: Locale configuration structure
- **TranslationStatus**: Translation metadata and status indicators
- **I18nConfig**: Docusaurus i18n configuration interface
- **LanguagePreference**: Browser storage schema
- **LanguageChangeEvent**: Event payload for language switches
- **TranslationStatusIndicatorProps**: Status indicator component props
- **RTLConfig**: RTL layout configuration

### 5. Quickstart Guide (quickstart.md)
Complete step-by-step implementation guide:
- **9 implementation steps**: Config setup, directory creation, UI translations, RTL CSS, component creation, DocItem swizzling, content translation, testing, deployment
- **Code examples**: Full working examples for each step
- **Testing checklist**: 8-item verification checklist
- **Troubleshooting section**: Common issues and solutions
- **Time estimate**: 30-45 minutes (excluding content translation)

**Implementation Phases Defined**:
1. **Phase 1 (P1 - MVP)**: Core infrastructure (i18n config, LanguageToggle, RTL CSS, DocItem swizzle, localStorage, 1 sample chapter)
2. **Phase 2 (P2 - UX)**: Status indicators, scroll preservation, URL parameters, navbar dropdown, completeness badges
3. **Phase 3 (P3 - Quality)**: Metadata tracking, contribution links, freshness warnings, CI/CD validation

**Risk Mitigation Table**: 6 risks with impact/likelihood/mitigation strategies
**Testing Strategy**: 5 test types (unit, integration, E2E, accessibility, visual regression)
**Success Metrics**: 8 measurable outcomes

### Technical Highlights

**Multi-Instance Architecture**:
- 5 Docusaurus instances (main-site, module1-ros2, module2-simulation, module3-isaac, module4-vla)
- Each instance: independent i18n config, own i18n/ur/ directory
- Shared component: LanguageToggle in shared/ workspace
- Consistent configuration across all instances

**RTL Layout Strategy**:
```css
html[dir='rtl'] { direction: rtl; }
html[dir='rtl'] pre, html[dir='rtl'] code {
  direction: ltr;
  unicode-bidi: embed;
}
```

**Constitutional Compliance**:
- ✅ Principle I: Educational Excellence (accessible to Urdu speakers)
- ✅ Principle VI: Accessibility & Inclusivity (removes language barriers)
- ✅ Principle X: Internationalization (direct implementation)
- ✅ Technical Infrastructure (Docusaurus v3, multi-instance)

### Unknowns Requiring Clarification

Three clarification points identified in research section:
1. **Toggle Placement**: Header, sidebar, or inline? → **Resolved**: Both inline at chapter start + navbar
2. **Translation Approach**: Professional vs. community → **Deferred**: Phase 2 decision
3. **Completeness Threshold**: 100% one module vs. partial all modules → **Deferred**: Launch decision

## Outcome

- ✅ Impact: Created production-ready implementation plan enabling Urdu-speaking students to access Physical AI content in native language
- 🧪 Tests: Constitution check passed (4/4 principles), architectural decisions validated, file structure verified
- 📁 Files:
  - Created specs/002-urdu-translation/plan.md (373 lines)
  - Created specs/002-urdu-translation/research.md (comprehensive research on 8 topics)
  - Created specs/002-urdu-translation/data-model.md (4 entities with schemas, flows, relationships)
  - Created specs/002-urdu-translation/quickstart.md (9-step implementation guide)
  - Created specs/002-urdu-translation/contracts/language-toggle-component.interface.ts (8 TypeScript interfaces)
- 🔁 Next prompts:
  1. `/sp.tasks` - Generate actionable tasks from implementation plan
  2. `/sp.clarify` - Resolve deferred clarification questions (translation approach, completeness threshold)
  3. `/sp.adr` - Document architectural decision (Docusaurus i18n vs custom system)
- 🧠 Reflection: The planning phase successfully transformed the specification into concrete technical implementation. The multi-instance architecture presents coordination challenges (5 configs to maintain) but enables modular deployment. RTL layout with code block preservation is critical for technical content quality. The shared component pattern balances consistency with instance independence. Three-phase implementation allows incremental delivery (MVP → UX → Quality).

## Evaluation notes (flywheel)

- Failure modes observed: None - all planning artifacts generated successfully
- Graders run and results (PASS/FAIL):
  - PASS - Constitution check (4/4 principles compliant)
  - PASS - Technical context completeness (all required fields filled)
  - PASS - Research depth (8 topics with decisions, rationale, alternatives)
  - PASS - Data model completeness (4 entities, schemas, flows, relationships)
  - PASS - API contracts (8 TypeScript interfaces with full documentation)
  - PASS - Quickstart guide (9 steps, code examples, troubleshooting)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider adding translation quality scoring in Phase 3 (automated checks for consistency, technical term accuracy)
