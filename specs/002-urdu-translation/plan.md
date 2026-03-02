# Implementation Plan: Urdu Translation with Chapter-Level Language Toggle

**Branch**: `002-urdu-translation` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-urdu-translation/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable Urdu-speaking students to view Physical AI textbook chapters in Urdu with a prominent language selection button at the start of each chapter. The implementation will configure Docusaurus i18n plugin to support Urdu (ur) with right-to-left (RTL) text direction, create a custom language toggle component integrated into the Docusaurus theme, and establish directory structure for Urdu translation files. The solution must preserve code syntax and technical elements in English while translating explanatory text, maintain language preference across navigation, and provide graceful fallback to English for untranslated content.

## Technical Context

**Language/Version**: JavaScript (ES6+) / Node.js 20+, React 18+
**Primary Dependencies**: Docusaurus v3.9+, @docusaurus/plugin-content-docs, @docusaurus/theme-classic, React 18
**Storage**: Browser localStorage for language preference persistence, file-based translation storage (i18n/ directory)
**Testing**: Jest for component tests, Playwright for end-to-end RTL layout testing, accessibility testing with axe-core
**Target Platform**: Web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) with RTL support
**Project Type**: Web - Multi-instance Docusaurus monorepo with workspaces (main-site, module1-ros2, module2-simulation, module3-isaac, module4-vla)
**Performance Goals**: Language switching < 2 seconds, initial page load with i18n < 3 seconds, no layout shift during RTL switch
**Constraints**: Must work without JavaScript (graceful degradation), RTL layout must not break code block rendering, translation files must follow Docusaurus i18n conventions
**Scale/Scope**: 5 Docusaurus instances (main-site + 4 modules), ~40 estimated chapters across all modules, Urdu as first international language (Arabic, Chinese, Spanish, French to follow same pattern)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Educational Excellence
- Enhances pedagogical accessibility for Urdu-speaking students
- Maintains progressive skill building through translated content
- No violations

### ✅ Principle VI: Accessibility and Inclusivity
- Directly addresses language barriers for students with AI/ML backgrounds
- Makes content accessible to non-English speakers
- No violations

### ✅ Principle X: Internationalization and Multilingual Accessibility
- Implements constitutional requirement for Docusaurus i18n plugin
- Provides chapter-level language selection button as mandated
- Urdu (ur) is a priority target language per constitution
- RTL support required by constitution
- Translation quality standards align with constitutional requirements
- No violations

### ✅ Technical Infrastructure Requirements
- Uses Docusaurus v3 (already established in project)
- Follows multi-instance architecture pattern
- Supports repository structure requirements
- No violations

### Constitution Compliance Summary
**Status**: ✅ All gates passed - No violations or complexity justifications needed

This feature directly implements constitutional Principle X requirements. The approach aligns with existing technical infrastructure and adds no architectural complexity.

## Project Structure

### Documentation (this feature)

```text
specs/002-urdu-translation/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - Docusaurus i18n best practices
├── data-model.md        # Phase 1 output - Language preference & translation metadata
├── quickstart.md        # Phase 1 output - Quick guide for enabling Urdu translation
├── contracts/           # Phase 1 output - React component interfaces
│   └── language-toggle-component.interface.ts
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Docusaurus Multi-Instance Web Application
main-site/
├── docusaurus.config.js     # Add i18n config for Urdu
├── i18n/                    # NEW: Internationalization directory
│   └── ur/                  # NEW: Urdu translations
│       ├── docusaurus-plugin-content-docs/
│       │   └── current/     # Translated markdown files
│       └── code.json        # UI string translations
├── src/
│   ├── components/
│   │   └── LanguageToggle/  # NEW: Language selection component
│   │       ├── index.tsx
│   │       ├── styles.module.css
│   │       └── LanguageToggle.test.tsx
│   ├── theme/               # NEW: Theme swizzling for i18n
│   │   └── DocItem/         # Customize doc page to include language toggle
│   │       └── index.tsx
│   └── css/
│       └── rtl.css          # NEW: RTL-specific styles
└── tests/
    └── e2e/
        └── urdu-translation.spec.ts  # NEW: E2E tests for language switching

module1-ros2/
├── docusaurus.config.js     # Add i18n config (same pattern as main-site)
├── i18n/
│   └── ur/                  # Module 1 Urdu translations
└── [same structure as main-site]

module2-simulation/
├── docusaurus.config.js     # Add i18n config
├── i18n/
│   └── ur/                  # Module 2 Urdu translations
└── [same structure as main-site]

module3-isaac/
├── docusaurus.config.js     # Add i18n config
├── i18n/
│   └── ur/                  # Module 3 Urdu translations
└── [same structure as main-site]

module4-vla/
├── docusaurus.config.js     # Add i18n config
├── i18n/
│   └── ur/                  # Module 4 Urdu translations
└── [same structure as main-site]

shared/
└── theme/                   # NEW: Shared theme components
    └── LanguageToggle/      # Shared language toggle (used by all instances)
        ├── index.tsx
        └── styles.module.css

# Translation workflow (outside main codebase)
.github/
└── workflows/
    └── i18n-validation.yml  # NEW: CI/CD for translation completeness
```

**Structure Decision**: The project uses a multi-instance Docusaurus web application architecture with npm workspaces. Each workspace (main-site, module1-ros2, module2-simulation, module3-isaac, module4-vla) represents a separate Docusaurus instance. The Urdu translation feature will be implemented across all instances using a shared theme component approach. The `LanguageToggle` component will be created in the `shared/` workspace and imported by all module instances to ensure consistency. Each instance will have its own `i18n/ur/` directory containing translated content specific to that module. Docusaurus i18n plugin will be configured in each instance's `docusaurus.config.js` to enable Urdu locale with RTL direction.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations identified - This section intentionally left empty.**

## Phase 0: Research & Decisions

### Research Topics

1. **Docusaurus i18n Plugin Configuration**
   - How to configure i18n plugin for RTL languages in Docusaurus v3
   - Best practices for multi-instance i18n in monorepo setup
   - Translation file structure and naming conventions

2. **RTL Layout Implementation**
   - CSS techniques for RTL text direction while preserving LTR code blocks
   - UI component mirroring strategies
   - Docusaurus theme swizzling for RTL support

3. **Language Preference Persistence**
   - localStorage vs cookies for language preference
   - Integration with Docusaurus routing and navigation
   - Handling language preference in URL parameters

4. **Translation Workflow**
   - Directory structure for translation files
   - Markdown translation best practices
   - Fallback mechanisms for incomplete translations

5. **Component Integration**
   - Where to inject language toggle component in doc pages
   - Theme swizzling best practices in Docusaurus v3
   - Shared component usage across multiple Docusaurus instances

### Unknowns to Resolve

- **NEEDS CLARIFICATION**: Exact placement of language toggle button - header, sidebar, or inline at chapter start?
- **NEEDS CLARIFICATION**: Initial translation approach - professional translators, community contributions, or combination?
- **NEEDS CLARIFICATION**: Translation completeness threshold before feature launch - 100% of one module or partial across all modules?

## Phase 1: Design Artifacts

### Data Model

**Entities:**
1. **LanguagePreference** (browser storage)
   - locale: string (e.g., 'en', 'ur')
   - direction: 'ltr' | 'rtl'
   - timestamp: number

2. **TranslationMetadata** (file-based)
   - sourceFile: string (path to original English markdown)
   - translatedFile: string (path to Urdu markdown)
   - lastTranslationDate: string (ISO date)
   - lastSourceUpdateDate: string (ISO date)
   - translatorCredit: string
   - reviewStatus: 'pending' | 'reviewed' | 'approved'

### API Contracts

**React Component Interfaces:**

```typescript
// contracts/language-toggle-component.interface.ts

export interface LanguageToggleProps {
  /** Current locale code */
  currentLocale: string;

  /** Available locales with labels and directions */
  availableLocales: LocaleConfig[];

  /** Callback when language is changed */
  onLanguageChange: (locale: string) => void;

  /** Display mode: 'button' | 'dropdown' */
  displayMode?: 'button' | 'dropdown';

  /** Position in layout */
  position?: 'header' | 'chapter-start' | 'sidebar';
}

export interface LocaleConfig {
  code: string;           // e.g., 'ur'
  label: string;          // e.g., 'اردو'
  direction: 'ltr' | 'rtl';
  flag?: string;          // Optional flag emoji or icon
}

export interface TranslationStatus {
  available: boolean;
  completeness: number;   // 0-100 percentage
  lastUpdated: string;    // ISO date
  isOutdated: boolean;    // True if source updated after translation
}
```

**Docusaurus Config Interface:**

```typescript
// contracts/docusaurus-i18n-config.interface.ts

export interface I18nConfig {
  defaultLocale: 'en';
  locales: string[];      // ['en', 'ur']
  localeConfigs: {
    [locale: string]: {
      label: string;
      direction: 'ltr' | 'rtl';
      htmlLang: string;
    };
  };
}
```

### Quickstart Guide

See [quickstart.md](./quickstart.md) for step-by-step guide to enabling Urdu translation in a Docusaurus instance.

## Phase 2: Implementation Strategy

### Architectural Decisions

**Decision 1: Shared Component vs. Instance-Specific**
- **Choice**: Shared component in `shared/theme/LanguageToggle/`
- **Rationale**: Ensures consistency across all 5 Docusaurus instances, reduces duplication
- **Alternatives Considered**: Instance-specific components (rejected due to maintenance overhead)

**Decision 2: Language Toggle Placement**
- **Choice**: Inline at chapter start + global navbar dropdown
- **Rationale**: Meets constitutional requirement for "prominent button at chapter start" while also providing persistent access in navbar
- **Alternatives Considered**: Sidebar only (rejected - not prominent enough), Header only (rejected - doesn't meet chapter-level requirement)

**Decision 3: RTL Implementation Approach**
- **Choice**: CSS direction properties with Docusaurus theme customization
- **Rationale**: Native browser RTL support is performant and standards-compliant
- **Alternatives Considered**: JavaScript-based layout flipping (rejected - performance overhead and complexity)

**Decision 4: Translation File Structure**
- **Choice**: Docusaurus i18n plugin standard structure (`i18n/ur/docusaurus-plugin-content-docs/current/`)
- **Rationale**: Follows Docusaurus best practices, enables automatic routing
- **Alternatives Considered**: Custom translation system (rejected - reinvents wheel)

**Decision 5: Translation Fallback Strategy**
- **Choice**: File-level fallback (if Urdu file missing, show English file)
- **Rationale**: Docusaurus handles this automatically, provides graceful degradation
- **Alternatives Considered**: Paragraph-level fallback (rejected - too complex for Phase 1)

### Implementation Phases

**Phase 1: Core Infrastructure (Priority P1 - MVP)**
1. Configure Docusaurus i18n plugin in all 5 instances
2. Create `i18n/ur/` directory structure in each instance
3. Implement shared `LanguageToggle` component
4. Swizzle `DocItem` theme to inject language toggle at chapter start
5. Add RTL CSS styles
6. Implement localStorage-based language preference persistence
7. Test with one sample chapter translated to Urdu

**Phase 2: UI/UX Enhancements (Priority P2)**
8. Add translation status indicators
9. Implement smooth language switching without scroll position loss
10. Add URL parameter support (`?lang=ur`)
11. Enhance navbar with language dropdown
12. Add translation completeness badges

**Phase 3: Quality & Transparency (Priority P3)**
13. Create translation metadata tracking
14. Add "contribute translation" links for untranslated content
15. Implement translation freshness warnings
16. Add CI/CD validation for translation completeness

### Integration Points

1. **Docusaurus Plugin System**: i18n plugin integration in each instance's config
2. **React Theme Layer**: Swizzled DocItem component for chapter-level toggle
3. **Browser Storage API**: localStorage for language preference
4. **URL Routing**: Docusaurus routing with language prefixes (`/ur/module1/intro`)
5. **CSS Theme System**: RTL styles integrated with Docusaurus theme
6. **Build System**: npm workspace scripts for i18n builds

### Risk Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| RTL layout breaks code blocks | High | Medium | Use CSS `:dir()` pseudo-class and `unicode-bidi: embed` for code blocks |
| Language switching causes layout shift | Medium | High | Preload fonts, use `content-visibility` CSS, test with Cumulative Layout Shift metrics |
| Translation files become outdated | Medium | High | Implement CI/CD checks for translation freshness, add automated warnings |
| Shared component conflicts across instances | Medium | Low | Use Docusaurus plugin system for component registration, versioning |
| Performance degradation with i18n | Low | Medium | Lazy-load translation files, use Docusaurus built-in code splitting |
| Missing Urdu font support | Low | Low | Include Noto Sans Urdu in web fonts, test on Windows/Mac/Linux |

### Testing Strategy

1. **Unit Tests** (Jest + React Testing Library)
   - LanguageToggle component rendering
   - Language preference persistence logic
   - Locale configuration validation

2. **Integration Tests** (Playwright)
   - Language switching workflow
   - RTL layout rendering
   - Fallback to English for untranslated content

3. **E2E Tests** (Playwright)
   - Complete user journey: view chapter → switch to Urdu → navigate to another chapter → verify Urdu persists
   - URL sharing with `?lang=ur` parameter
   - Browser back/forward navigation with language state

4. **Accessibility Tests** (axe-core)
   - WCAG 2.1 AA compliance for RTL layout
   - Keyboard navigation for language toggle
   - Screen reader compatibility with language switching

5. **Visual Regression Tests** (Percy or Chromatic)
   - RTL layout screenshots
   - Code block rendering in RTL context
   - UI component mirroring verification

### Success Metrics

- All 5 Docusaurus instances successfully build with Urdu locale enabled
- Language toggle component renders on all chapter pages
- RTL layout applies correctly with no code block rendering issues
- Language preference persists across navigation (tested with 5+ chapter traversals)
- At least 1 complete module translated to Urdu for launch validation
- All automated tests pass (unit, integration, E2E, accessibility)
- Build time increase < 20% with i18n enabled
- Page load time increase < 500ms for Urdu pages vs. English pages

## Notes

- This feature establishes the i18n pattern that will be reused for Arabic, Chinese, Spanish, and French translations (separate features following same implementation)
- Translation content creation is out of scope for this technical implementation - focus is on infrastructure to display and manage translations
- Community contribution workflow for translations should be documented but not fully automated in Phase 1
- Consider creating a separate `/sp.adr` for the decision to use Docusaurus i18n plugin vs. custom translation system
