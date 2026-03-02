# Data Model: Urdu Translation with Chapter-Level Language Toggle

**Feature**: 002-urdu-translation
**Created**: 2025-12-30
**Purpose**: Define data structures for language preference storage, translation metadata, and component state management

## Overview

This feature requires two primary data models:
1. **Browser-stored language preference** (client-side persistence)
2. **File-based translation metadata** (build-time validation and runtime status)

## Entity Definitions

### 1. LanguagePreference (Browser Storage)

**Storage Location**: `localStorage['docusaurus.locale']` (Docusaurus convention)

**Purpose**: Persist user's selected language across sessions and page navigation

**Schema**:
```typescript
interface LanguagePreference {
  /** Selected locale code (e.g., 'en', 'ur') */
  locale: string;

  /** Text direction for the locale */
  direction: 'ltr' | 'rtl';

  /** Timestamp of when preference was set (Unix milliseconds) */
  timestamp: number;

  /** Optional: User's preferred display mode for language toggle */
  displayMode?: 'button' | 'dropdown';
}
```

**Example Data**:
```json
{
  "locale": "ur",
  "direction": "rtl",
  "timestamp": 1735574400000,
  "displayMode": "dropdown"
}
```

**Validation Rules**:
- `locale` must be one of the configured locales in `docusaurus.config.js`
- `direction` must be 'ltr' or 'rtl'
- `timestamp` must be a valid Unix timestamp in milliseconds
- `displayMode` is optional, defaults to 'button'

**State Transitions**:
```
Initial State (no preference) → User selects language → LanguagePreference stored
LanguagePreference exists → User changes language → LanguagePreference updated
LanguagePreference exists → User clears browser data → Reset to Initial State
```

**Access Patterns**:
- **Read**: On page load, check localStorage for existing preference
- **Write**: When user selects a language via LanguageToggle component
- **Delete**: When user explicitly resets language preference (rare)

---

### 2. TranslationMetadata (File-based)

**Storage Location**: `specs/002-urdu-translation/translation-status.json` (build artifact)

**Purpose**: Track translation completeness, freshness, and quality metadata for each translated file

**Schema**:
```typescript
interface TranslationMetadata {
  /** Relative path to source English markdown file */
  sourceFile: string;

  /** Relative path to translated Urdu markdown file */
  translatedFile: string;

  /** ISO 8601 date when translation was last updated */
  lastTranslationDate: string;

  /** ISO 8601 date when source file was last modified */
  lastSourceUpdateDate: string;

  /** Name or identifier of translator(s) */
  translatorCredit: string;

  /** Review status of the translation */
  reviewStatus: 'pending' | 'reviewed' | 'approved';

  /** Percentage of source content translated (0-100) */
  completeness: number;

  /** Flag indicating if source was updated after translation */
  isOutdated: boolean;
}
```

**Example Data**:
```json
{
  "sourceFile": "main-site/docs/module1/intro.md",
  "translatedFile": "main-site/i18n/ur/docusaurus-plugin-content-docs/current/module1/intro.md",
  "lastTranslationDate": "2025-12-30T00:00:00Z",
  "lastSourceUpdateDate": "2025-12-28T12:00:00Z",
  "translatorCredit": "Dr. Ahmad Khan",
  "reviewStatus": "approved",
  "completeness": 100,
  "isOutdated": false
}
```

**Validation Rules**:
- `sourceFile` and `translatedFile` must be valid file paths
- `lastTranslationDate` and `lastSourceUpdateDate` must be valid ISO 8601 dates
- `reviewStatus` must be one of: 'pending', 'reviewed', 'approved'
- `completeness` must be between 0 and 100 (inclusive)
- `isOutdated` is computed: `lastSourceUpdateDate > lastTranslationDate`

**State Transitions**:
```
No translation → Translation created → reviewStatus: 'pending', completeness: 100
Translation pending → SME reviews → reviewStatus: 'reviewed'
Translation reviewed → Approved by maintainer → reviewStatus: 'approved'
Source updated → lastSourceUpdateDate changes → isOutdated: true
Outdated translation → Re-translated → lastTranslationDate updated, isOutdated: false
```

**Access Patterns**:
- **Build Time**: Generate `translation-status.json` by comparing file timestamps
- **Runtime**: Load status data to display translation indicators
- **CI/CD**: Validate completeness thresholds and flag outdated translations

---

### 3. LocaleConfig (Configuration)

**Storage Location**: `docusaurus.config.js` (static configuration)

**Purpose**: Define available locales and their display properties

**Schema**:
```typescript
interface LocaleConfig {
  /** Locale code (ISO 639-1 language code) */
  code: string;

  /** Display label in native language */
  label: string;

  /** Text direction for this locale */
  direction: 'ltr' | 'rtl';

  /** HTML lang attribute value */
  htmlLang: string;

  /** Optional flag emoji or icon path */
  flag?: string;
}
```

**Example Configuration**:
```javascript
// docusaurus.config.js
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'ur'],
  localeConfigs: {
    en: {
      label: 'English',
      direction: 'ltr',
      htmlLang: 'en-US',
      flag: '🇺🇸'
    },
    ur: {
      label: 'اردو',
      direction: 'rtl',
      htmlLang: 'ur-PK',
      flag: '🇵🇰'
    }
  }
}
```

**Validation Rules**:
- `code` must be a valid ISO 639-1 language code
- `label` should be in the native language of the locale
- `direction` must be 'ltr' or 'rtl'
- `htmlLang` should follow BCP 47 format (language-region)

---

### 4. TranslationStatus (Runtime Component State)

**Storage Location**: React component state (derived from TranslationMetadata)

**Purpose**: Provide real-time translation status information to UI components

**Schema**:
```typescript
interface TranslationStatus {
  /** Whether translation is available for current page */
  available: boolean;

  /** Completion percentage (0-100) */
  completeness: number;

  /** ISO date of last translation update */
  lastUpdated: string;

  /** Whether translation is outdated relative to source */
  isOutdated: boolean;

  /** Optional warning message for outdated/incomplete translations */
  warning?: string;
}
```

**Example Data**:
```typescript
const translationStatus: TranslationStatus = {
  available: true,
  completeness: 100,
  lastUpdated: "2025-12-30",
  isOutdated: false,
  warning: undefined
};

// For outdated translation:
const outdatedStatus: TranslationStatus = {
  available: true,
  completeness: 100,
  lastUpdated: "2025-12-20",
  isOutdated: true,
  warning: "This translation may not reflect recent updates to the original content."
};

// For unavailable translation:
const unavailableStatus: TranslationStatus = {
  available: false,
  completeness: 0,
  lastUpdated: "",
  isOutdated: false,
  warning: "Translation not yet available for this page. Showing English version."
};
```

---

## Data Flow Diagrams

### Language Selection Flow

```
User Action: Click Language Toggle
         ↓
LanguageToggle Component
         ↓
Update localStorage (LanguagePreference)
         ↓
Docusaurus Router
         ↓
Navigate to /ur/[page-path]
         ↓
Check TranslationMetadata
         ↓
   ┌─────────────┬──────────────┐
   ↓             ↓              ↓
Available    Outdated       Unavailable
   ↓             ↓              ↓
Render       Render with     Fallback to
Urdu         Warning         English
```

### Translation Status Check Flow

```
Page Load
    ↓
Read LanguagePreference from localStorage
    ↓
Current locale = 'ur'?
    ↓ Yes
Load translation-status.json
    ↓
Find metadata for current page
    ↓
   ┌──────────────────┐
   ↓                  ↓
Found            Not Found
   ↓                  ↓
Compute          Set available=false
TranslationStatus    ↓
   ↓              Display fallback
Render status     warning
indicator
```

## Storage Considerations

### Browser Storage (localStorage)

**Capacity**: 5-10 MB per origin (sufficient for LanguagePreference)

**Persistence**: Data survives page reloads and browser restarts

**Access**: Synchronous JavaScript API

**Privacy**: Per-origin isolation, cleared with browser data

**Fallback Strategy**: If localStorage unavailable (privacy mode), use in-memory state (preference lost on page reload)

### File-based Storage (translation-status.json)

**Location**: Build output directory (`build/translation-status.json`)

**Generation**: CI/CD pipeline or pre-build script

**Size**: Approximately 1-5 KB for 40 chapters

**Access**: HTTP fetch at runtime (cached by browser)

**Update Frequency**: Regenerated on each build/deployment

---

## Relationships

```
LocaleConfig (1) ←──→ (N) LanguagePreference
   ↓
   └──→ Used to validate LanguagePreference.locale

TranslationMetadata (N) ──→ (1) sourceFile
   ↓
   └──→ Aggregated into TranslationStatus at runtime

LanguagePreference.locale ──→ Filters relevant TranslationMetadata
```

---

## Data Quality Constraints

1. **Referential Integrity**: `LanguagePreference.locale` must exist in `LocaleConfig.locales`
2. **Temporal Consistency**: `isOutdated` must accurately reflect file timestamp comparison
3. **Completeness Accuracy**: `completeness` percentage should be mechanically validated (not manually entered)
4. **Review Workflow**: Translation should not be marked 'approved' without SME review

---

## Migration Strategy

**Phase 1 (MVP)**:
- Implement LanguagePreference with localStorage
- Basic TranslationMetadata tracking (manual JSON file)

**Phase 2 (Enhanced)**:
- Automated translation-status.json generation via build script
- TranslationStatus component with visual indicators

**Phase 3 (Advanced)**:
- Translation management dashboard
- Automated staleness detection in CI/CD
- Translator contribution tracking

---

## Notes

- Docusaurus i18n plugin automatically handles URL routing based on locale
- Translation files must mirror source directory structure in `i18n/[locale]/` subdirectory
- Consider adding `translationVersion` field to TranslationMetadata for major/minor versioning
- Future enhancement: Add `translationQualityScore` based on automated checks
