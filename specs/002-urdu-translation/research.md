# Research: Urdu Translation with Chapter-Level Language Toggle

**Feature**: 002-urdu-translation
**Created**: 2025-12-30
**Purpose**: Document research findings and decisions for implementing Urdu translation in Docusaurus

## Research Topics

This document captures research findings for the key technical decisions required to implement Urdu translation feature.

---

## 1. Docusaurus i18n Plugin Configuration for RTL Languages

### Decision

Use Docusaurus built-in i18n plugin with explicit RTL configuration in `localeConfigs`.

### Research Findings

**Official Docusaurus i18n Support**:
- Docusaurus v3 has first-class i18n support via `@docusaurus/plugin-content-docs`
- RTL languages require explicit `direction: 'rtl'` in locale configuration
- Locale codes should follow ISO 639-1 standard (e.g., 'ur' for Urdu)
- Each locale gets its own subdirectory under `i18n/[locale]/`

**Configuration Pattern**:
```javascript
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'ur'],
  localeConfigs: {
    en: {
      label: 'English',
      direction: 'ltr',
      htmlLang: 'en-US',
    },
    ur: {
      label: 'اردو',
      direction: 'rtl',
      htmlLang: 'ur-PK',
    },
  },
}
```

**Rationale**:
- Leverages Docusaurus's built-in RTL support (no custom implementation needed)
- Automatic URL routing (`/ur/page-path`)
- Built-in fallback to default locale for untranslated content
- SEO-friendly with proper `<html lang="ur-PK" dir="rtl">` attributes

**Alternatives Considered**:
1. **Custom translation system**: Rejected - reinvents wheel, loses Docusaurus ecosystem benefits
2. **Third-party i18n library (react-i18next)**: Rejected - unnecessary complexity, doesn't integrate with Docusaurus routing
3. **Manual URL parameter handling**: Rejected - poor SEO, doesn't follow Docusaurus conventions

**References**:
- [Docusaurus i18n Introduction](https://docusaurus.io/docs/i18n/introduction)
- [Docusaurus i18n Tutorial](https://docusaurus.io/docs/i18n/tutorial)

---

## 2. Multi-Instance Docusaurus i18n in Monorepo Setup

### Decision

Configure i18n independently in each Docusaurus instance (main-site, module1-ros2, etc.) with shared theme components in `shared/` workspace.

### Research Findings

**Monorepo Challenges**:
- Each Docusaurus instance in npm workspace is independent
- Translation files must exist in each instance's `i18n/` directory
- Cannot share translation files across instances (Docusaurus limitation)
- Can share React components via workspace dependencies

**Recommended Approach**:
1. **Instance-Specific Configuration**: Each instance has its own `docusaurus.config.js` with i18n configuration
2. **Instance-Specific Translations**: Each instance has its own `i18n/ur/` directory structure
3. **Shared UI Components**: `LanguageToggle` component in `shared/theme/` imported by all instances
4. **Consistent Configuration**: Use same locale codes and structure across all instances

**Implementation Pattern**:
```
shared/
└── theme/
    └── LanguageToggle/
        ├── index.tsx          # Shared component
        └── styles.module.css

main-site/
├── docusaurus.config.js       # i18n config
├── i18n/ur/                   # Main site translations
└── package.json               # Dependency: shared workspace

module1-ros2/
├── docusaurus.config.js       # Same i18n config
├── i18n/ur/                   # Module 1 translations
└── package.json               # Dependency: shared workspace
```

**Rationale**:
- Respects Docusaurus's instance isolation while enabling code reuse
- Each module can have translations deployed independently
- Shared component ensures UI consistency
- Scalable to additional languages (ar, zh-CN, es, fr)

**Alternatives Considered**:
1. **Symlinked i18n directories**: Rejected - breaks on Windows, fragile
2. **Build-time translation copying**: Rejected - complex build process, harder to maintain
3. **Single mega-instance**: Rejected - contradicts multi-instance architecture decision

**References**:
- [npm Workspaces Documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Docusaurus Multi-Instance Setup](https://docusaurus.io/docs/docs-multi-instance)

---

## 3. Translation File Structure and Naming Conventions

### Decision

Follow Docusaurus standard structure: `i18n/[locale]/docusaurus-plugin-content-docs/current/[path-to-file].md`

### Research Findings

**Docusaurus Convention**:
- Plugin name in path: `docusaurus-plugin-content-docs`
- Version folder: `current` (or version number like `version-2.0`)
- Mirror source structure: `current/module1/intro.md` mirrors `docs/module1/intro.md`
- Separate file for UI strings: `i18n/[locale]/code.json`

**Directory Structure**:
```
i18n/
└── ur/
    ├── code.json                                 # UI string translations
    ├── docusaurus-plugin-content-docs/
    │   └── current/
    │       ├── intro.md
    │       ├── module1/
    │       │   ├── intro.md
    │       │   └── chapter1.md
    │       └── module2/
    │           └── intro.md
    └── docusaurus-theme-classic/
        ├── footer.json                           # Footer translations
        └── navbar.json                           # Navbar translations
```

**Rationale**:
- Docusaurus automatically discovers and routes translations
- Build system knows which files to use for each locale
- Fallback mechanism works automatically (missing file → use English)
- Clear separation between content (markdown) and UI strings (JSON)

**Alternatives Considered**:
1. **Flat structure with locale suffix** (`intro-ur.md`): Rejected - doesn't work with Docusaurus
2. **Single JSON file for all translations**: Rejected - hard to maintain for large content
3. **Database-backed translations**: Rejected - static site requirement

**References**:
- [Docusaurus Translation Files Location](https://docusaurus.io/docs/i18n/tutorial#translate-your-site)

---

## 4. RTL Layout Implementation

### Decision

Use CSS `direction` property with `html[dir='rtl']` selector, preserving LTR for code blocks via `unicode-bidi: embed`.

### Research Findings

**Native Browser RTL Support**:
- Modern browsers fully support `dir="rtl"` attribute
- CSS `direction: rtl` property handles text flow
- Flexbox and Grid automatically adjust in RTL mode
- No JavaScript required for basic RTL layout

**Code Block Preservation**:
```css
html[dir='rtl'] pre,
html[dir='rtl'] code {
  direction: ltr;
  text-align: left;
  unicode-bidi: embed;  /* Isolates LTR content in RTL context */
}
```

**UI Mirroring**:
```css
/* Mirror navigation */
html[dir='rtl'] .navbar__item {
  margin-left: var(--ifm-navbar-item-padding-horizontal);
  margin-right: 0;
}

/* Mirror sidebar */
html[dir='rtl'] .theme-doc-sidebar-container {
  border-left: 1px solid var(--ifm-toc-border-color);
  border-right: none;
}
```

**Rationale**:
- Performant (browser-native rendering)
- Standards-compliant (W3C spec)
- Minimal JavaScript (only for toggle, not layout)
- Graceful degradation (works without JavaScript for pre-selected locale)

**Alternatives Considered**:
1. **JavaScript-based layout flipping**: Rejected - performance overhead, layout shift risk
2. **Separate RTL CSS file**: Rejected - duplication, maintenance burden
3. **CSS logical properties only**: Rejected - incomplete browser support for older versions

**Key Considerations**:
- Mathematical notation must remain LTR
- Diagrams and flowcharts must preserve directionality
- Technical acronyms (URLs, code) must stay LTR even in RTL sentences

**References**:
- [MDN: CSS direction property](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
- [W3C: Structural markup and right-to-left text in HTML](https://www.w3.org/International/questions/qa-html-dir)
- [RTL Styling 101](https://rtlstyling.com/posts/rtl-styling)

---

## 5. Language Preference Persistence

### Decision

Use `localStorage` with key `'docusaurus.locale'` (Docusaurus convention) for persistence, with in-memory fallback for privacy mode.

### Research Findings

**localStorage vs. Cookies**:

| Feature | localStorage | Cookies |
|---------|--------------|---------|
| Capacity | 5-10 MB | 4 KB |
| Persistence | Until manually cleared | Expiration date |
| Accessibility | Client-side only | Sent with every HTTP request |
| Privacy Mode | Blocked | Allowed (session cookies) |
| API Complexity | Simple (get/set) | More complex (parsing) |

**Decision Factors**:
- Docusaurus theme uses `localStorage` for theme preference (consistency)
- Language preference doesn't need server-side access
- 5-10 MB capacity sufficient for future extensions (display mode, etc.)
- Synchronous API (no async complexity)

**Implementation**:
```typescript
// Save preference
localStorage.setItem('docusaurus.locale', 'ur');

// Read preference
const savedLocale = localStorage.getItem('docusaurus.locale');

// Fallback for privacy mode
let currentLocale = 'en';
try {
  currentLocale = localStorage.getItem('docusaurus.locale') || 'en';
} catch (e) {
  // localStorage unavailable in privacy mode - use in-memory state
  console.warn('localStorage unavailable, language preference will not persist');
}
```

**Rationale**:
- Aligns with Docusaurus conventions
- No server-side dependency (static site compatible)
- Larger capacity for future feature extensions
- Better privacy (not sent with requests)

**Alternatives Considered**:
1. **Cookies**: Rejected - unnecessary server communication, smaller capacity
2. **IndexedDB**: Rejected - overkill for simple key-value storage, async complexity
3. **URL parameter only**: Rejected - poor UX (preference lost without URL)

**References**:
- [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Docusaurus: ColorMode Persistence](https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-common/src/utils/colorModeUtils.ts)

---

## 6. Theme Swizzling for Component Injection

### Decision

Use "wrap" swizzling for `DocItem` component to inject `LanguageToggle` at chapter start.

### Research Findings

**Docusaurus Swizzling Modes**:
1. **Eject**: Copy entire component, full customization (unsafe - may break on upgrades)
2. **Wrap**: Wrap original component, inject before/after (safe - compatible with upgrades)

**Swizzling Command**:
```bash
npm run swizzle @docusaurus/theme-classic DocItem -- --wrap
```

**Wrapper Pattern**:
```typescript
import React from 'react';
import DocItem from '@theme-original/DocItem';
import LanguageToggle from '@site/src/components/LanguageToggle';

export default function DocItemWrapper(props) {
  return (
    <>
      <LanguageToggle position="chapter-start" />
      <DocItem {...props} />
    </>
  );
}
```

**Rationale**:
- "Wrap" mode is safe (Docusaurus upgrade-compatible)
- Minimal code (doesn't duplicate original component)
- Constitutional requirement met (toggle at chapter start)
- Easy to remove or modify without breaking theme

**Alternatives Considered**:
1. **Eject mode**: Rejected - fragile on Docusaurus upgrades, maintenance burden
2. **Custom plugin**: Rejected - overkill for simple component injection
3. **Manual insertion in every markdown file**: Rejected - unsustainable, error-prone

**Placement Options Evaluated**:
- ✅ **DocItem wrapper**: Appears on every doc page automatically
- ❌ **Navbar**: Doesn't meet "chapter start" requirement
- ❌ **Sidebar**: Not prominent enough, hidden on mobile

**References**:
- [Docusaurus Swizzling Documentation](https://docusaurus.io/docs/swizzling)
- [Theme Component List](https://docusaurus.io/docs/api/themes/@docusaurus/theme-classic)

---

## 7. URL Parameter Handling for Language Specification

### Decision

Support `?lang=ur` URL parameter for sharing, redirecting to proper locale URL prefix (`/ur/`).

### Research Findings

**Docusaurus Routing**:
- Default routing: `/<locale>/<page-path>` (e.g., `/ur/module1/intro`)
- Default locale omitted: `/module1/intro` (English)
- Automatic language detection from URL path

**URL Parameter Pattern**:
```typescript
// Detect ?lang=ur parameter
const urlParams = new URLSearchParams(window.location.search);
const langParam = urlParams.get('lang');

if (langParam && langParam !== currentLocale) {
  // Redirect to proper locale URL
  const pathWithoutLocale = location.pathname.replace(/^\/(en|ur)/, '');
  const newPath = langParam === defaultLocale
    ? pathWithoutLocale
    : `/${langParam}${pathWithoutLocale}`;

  window.location.replace(newPath);
}
```

**Rationale**:
- SEO-friendly (canonical URL in path, not parameter)
- Shareable URLs work reliably
- Compatible with Docusaurus routing conventions
- Search engines index proper locale URLs

**User Flow**:
1. User shares link: `https://site.com/module1/intro?lang=ur`
2. Recipient opens link
3. JavaScript detects `?lang=ur` parameter
4. Redirects to `https://site.com/ur/module1/intro`
5. Language preference saved to localStorage
6. Future navigation uses Urdu automatically

**Alternatives Considered**:
1. **Parameter-only routing**: Rejected - poor SEO, doesn't match Docusaurus conventions
2. **No URL parameter support**: Rejected - harder to share specific language versions
3. **Fragment identifier (`#lang=ur`)**: Rejected - not indexed by search engines

**References**:
- [Docusaurus i18n Routing](https://docusaurus.io/docs/i18n/introduction#locale-dropdown)
- [URL Structure Best Practices](https://developers.google.com/search/docs/advanced/crawling/localized-versions)

---

## 8. Translation Workflow and Fallback Mechanisms

### Decision

File-level fallback (if `i18n/ur/[path].md` missing, serve English version from `docs/[path].md`).

### Research Findings

**Docusaurus Built-in Fallback**:
- If translation file doesn't exist, Docusaurus automatically serves default locale file
- No code required - happens during build
- Graceful user experience (content always available)

**Fallback Levels**:
1. **File-level** (Docusaurus default): Missing Urdu file → serve English file
2. **Paragraph-level** (custom): Mixed English/Urdu within same file (requires custom plugin)
3. **String-level** (complex): Inline fallback for each translatable string (requires custom system)

**Rationale**:
- File-level fallback is built-in (no custom code)
- Simpler mental model for translators (entire file or nothing)
- Build-time determination (better performance than runtime checks)
- Clear indication to users (entire page in one language, not mixed)

**Translation Status Indicator**:
```typescript
// Future enhancement - show status badge
interface TranslationStatus {
  available: boolean;
  completeness: number;  // 0-100%
  lastUpdated: string;
}
```

**Workflow Phases**:

**Phase 1 (MVP)**: Manual translation
1. Translator copies English markdown to `i18n/ur/`
2. Translates text (preserves code blocks)
3. Commits to repository
4. Build automatically detects new translation

**Phase 2 (Enhanced)**: Status tracking
1. Build script generates `translation-status.json`
2. UI shows translation completeness badges
3. Warnings for outdated translations

**Phase 3 (Advanced)**: Automated workflow
1. GitHub Actions detect changes to English content
2. Create translation update issues automatically
3. Community translators submit PRs
4. SME review process

**Alternatives Considered**:
1. **Paragraph-level fallback**: Rejected - too complex for Phase 1, confusing UX
2. **Machine translation with human review**: Deferred to Phase 2 (infrastructure first)
3. **Translation management system (TMS)**: Deferred - overkill for initial launch

**References**:
- [Docusaurus i18n Fallback Behavior](https://docusaurus.io/docs/i18n/tutorial#translate-your-site)

---

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| i18n Plugin | Use Docusaurus built-in with RTL config | First-class support, automatic routing, SEO-friendly |
| Multi-Instance | Independent configs, shared components | Respects instance isolation, enables code reuse |
| File Structure | Follow Docusaurus conventions (`i18n/ur/...`) | Automatic discovery, clear organization |
| RTL Layout | CSS `direction` property with code block exceptions | Native browser support, performant, standards-compliant |
| Persistence | localStorage with fallback | Aligns with Docusaurus, larger capacity, better privacy |
| Component Injection | Wrap swizzling for DocItem | Safe upgrades, minimal code, meets constitutional requirement |
| URL Parameters | Support `?lang=ur` with redirect to `/ur/` | Shareable links, SEO-friendly, compatible with routing |
| Fallback | File-level (Docusaurus built-in) | Simple, performant, clear UX |

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Docusaurus upgrade breaks swizzled component | Use "wrap" mode (safe), test on upgrades |
| RTL layout shifts during language switch | Preload fonts, CSS containment, measure CLS |
| Translation files get out of sync | Automated validation in CI/CD |
| Shared component version conflicts | Pin versions in workspace dependencies |

---

## Next Steps

1. ✅ Configure i18n in all Docusaurus instances
2. ✅ Create shared LanguageToggle component
3. ✅ Implement RTL CSS styles
4. ✅ Swizzle DocItem component
5. ⏸️ Translate pilot chapter for testing
6. ⏸️ Set up CI/CD validation
7. ⏸️ Document translation contributor guidelines

---

## References

- [Docusaurus i18n Documentation](https://docusaurus.io/docs/i18n/introduction)
- [W3C Internationalization Best Practices](https://www.w3.org/International/quicktips/)
- [RTL Styling Guide](https://rtlstyling.com/)
- [MDN: CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [Google I18n Guidelines](https://developers.google.com/international/translation)
