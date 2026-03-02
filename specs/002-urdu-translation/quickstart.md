# Quickstart Guide: Enabling Urdu Translation in Docusaurus

**Feature**: 002-urdu-translation
**Created**: 2025-12-30
**Audience**: Developers implementing Urdu translation feature

## Overview

This guide provides step-by-step instructions for enabling Urdu (اردو) translation in a Docusaurus instance with right-to-left (RTL) support and chapter-level language toggle.

**Time to Complete**: ~30-45 minutes (excluding content translation)

**Prerequisites**:
- Docusaurus v3.9+ installed
- Node.js 20+ and npm 9+
- Basic knowledge of React and TypeScript
- Understanding of Docusaurus theme customization

---

## Step 1: Configure Docusaurus i18n Plugin

Edit `docusaurus.config.js` in your Docusaurus instance (e.g., `main-site/docusaurus.config.js`):

```javascript
// @ts-check
/** @type {import('@docusaurus/types').Config} */
const config = {
  // ... existing config ...

  // Internationalization configuration
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ur'],  // Add 'ur' for Urdu
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
  },

  // ... rest of config ...
};

module.exports = config;
```

**Verification**:
```bash
npm run build
# Should see: "Compiling your site for locales: en, ur"
```

---

## Step 2: Create Translation Directory Structure

Create the directory structure for Urdu translations:

```bash
# Navigate to your Docusaurus instance
cd main-site

# Create Urdu translation directories
mkdir -p i18n/ur/docusaurus-plugin-content-docs/current
mkdir -p i18n/ur/docusaurus-theme-classic

# Create code.json for UI string translations
touch i18n/ur/code.json
```

**Directory Structure**:
```
main-site/
├── i18n/
│   └── ur/
│       ├── code.json                          # UI strings (navbar, footer, etc.)
│       ├── docusaurus-plugin-content-docs/
│       │   └── current/                       # Translated markdown files
│       │       ├── intro.md
│       │       ├── module1/
│       │       │   └── intro.md
│       │       └── ...
│       └── docusaurus-theme-classic/
│           └── navbar.json                    # Navbar translations
```

---

## Step 3: Add UI String Translations

Create `i18n/ur/code.json` with translated UI strings:

```json
{
  "theme.NotFound.title": {
    "message": "صفحہ نہیں ملا",
    "description": "The title of the 404 page"
  },
  "theme.NotFound.p1": {
    "message": "ہم آپ کی تلاش کا صفحہ نہیں ڈھونڈ سکے۔",
    "description": "The first paragraph of the 404 page"
  },
  "theme.NotFound.p2": {
    "message": "براہ کرم سائٹ کے مالک سے رابطہ کریں۔",
    "description": "The 2nd paragraph of the 404 page"
  },
  "theme.docs.sidebar.collapseButtonTitle": {
    "message": "سائڈبار چھپائیں",
    "description": "The title attribute for collapse button of doc sidebar"
  },
  "theme.docs.sidebar.expandButtonTitle": {
    "message": "سائڈبار کھولیں",
    "description": "The title attribute for expand button of doc sidebar"
  }
}
```

**Tip**: Run `npm run write-translations -- --locale ur` to generate a template with all translatable strings.

---

## Step 4: Add RTL CSS Styles

Create `src/css/rtl.css` for RTL-specific styling:

```css
/* RTL (Right-to-Left) Styles for Urdu */

/* Apply RTL direction to HTML when Urdu locale is active */
html[dir='rtl'] {
  direction: rtl;
  text-align: right;
}

/* Keep code blocks LTR even in RTL mode */
html[dir='rtl'] pre,
html[dir='rtl'] code {
  direction: ltr;
  text-align: left;
  unicode-bidi: embed;
}

/* Mirror navigation elements */
html[dir='rtl'] .navbar__item {
  margin-right: 0;
  margin-left: var(--ifm-navbar-item-padding-horizontal);
}

/* Mirror sidebar */
html[dir='rtl'] .theme-doc-sidebar-container {
  border-left: 1px solid var(--ifm-toc-border-color);
  border-right: none;
}

/* Mirror table of contents */
html[dir='rtl'] .table-of-contents {
  padding-left: 0;
  padding-right: var(--ifm-toc-padding-horizontal);
}

/* Preserve mathematical notation and diagrams as LTR */
html[dir='rtl'] .math,
html[dir='rtl'] .katex,
html[dir='rtl'] svg {
  direction: ltr;
  text-align: left;
}

/* Mirror breadcrumbs */
html[dir='rtl'] .breadcrumbs__item::before {
  margin-left: 0.5rem;
  margin-right: 0;
  transform: rotate(180deg);
}

/* Mirror pagination */
html[dir='rtl'] .pagination-nav__link {
  text-align: right;
}

html[dir='rtl'] .pagination-nav__label::before {
  content: '←';
  margin-left: 0.5rem;
  margin-right: 0;
}

html[dir='rtl'] .pagination-nav__label::after {
  content: '';
}
```

Import this CSS in `src/css/custom.css`:

```css
@import './rtl.css';
```

---

## Step 5: Create Language Toggle Component

Create `src/components/LanguageToggle/index.tsx`:

```typescript
import React from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

interface LanguageToggleProps {
  position?: 'header' | 'chapter-start' | 'sidebar';
}

export default function LanguageToggle({ position = 'chapter-start' }: LanguageToggleProps) {
  const { i18n } = useDocusaurusContext();
  const location = useLocation();

  const currentLocale = i18n.currentLocale;
  const locales = i18n.locales;

  const handleLanguageChange = (newLocale: string) => {
    // Save preference to localStorage
    localStorage.setItem('docusaurus.locale', newLocale);

    // Build new URL with locale prefix
    const pathWithoutLocale = location.pathname.replace(/^\/(en|ur)/, '');
    const newPath = newLocale === i18n.defaultLocale
      ? pathWithoutLocale
      : `/${newLocale}${pathWithoutLocale}`;

    // Navigate to new URL
    window.location.pathname = newPath;
  };

  return (
    <div className={`${styles.languageToggle} ${styles[position]}`}>
      <div className={styles.toggleButtons}>
        {locales.map((locale) => {
          const config = i18n.localeConfigs[locale];
          const isActive = locale === currentLocale;

          return (
            <button
              key={locale}
              onClick={() => handleLanguageChange(locale)}
              className={`${styles.toggleButton} ${isActive ? styles.active : ''}`}
              aria-label={`Switch to ${config.label}`}
              aria-current={isActive ? 'true' : 'false'}
            >
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

Create `src/components/LanguageToggle/styles.module.css`:

```css
.languageToggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggleButtons {
  display: flex;
  gap: 0.25rem;
  background: var(--ifm-color-emphasis-100);
  border-radius: var(--ifm-button-border-radius);
  padding: 0.25rem;
}

.toggleButton {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--ifm-button-border-radius);
  font-weight: 500;
  transition: all 0.2s ease;
  color: var(--ifm-color-content);
}

.toggleButton:hover {
  background: var(--ifm-color-emphasis-200);
}

.toggleButton.active {
  background: var(--ifm-color-primary);
  color: var(--ifm-color-primary-contrast-foreground);
}

.chapterStart {
  margin-bottom: 2rem;
  justify-content: flex-start;
}

.header {
  justify-content: center;
}

.sidebar {
  margin-top: 1rem;
  justify-content: center;
}
```

---

## Step 6: Integrate Language Toggle into Doc Pages

Swizzle the `DocItem` component to inject the language toggle:

```bash
npm run swizzle @docusaurus/theme-classic DocItem -- --wrap
```

Edit `src/theme/DocItem/index.tsx`:

```typescript
import React from 'react';
import DocItem from '@theme-original/DocItem';
import type DocItemType from '@theme/DocItem';
import type { WrapperProps } from '@docusaurus/types';
import LanguageToggle from '@site/src/components/LanguageToggle';

type Props = WrapperProps<typeof DocItemType>;

export default function DocItemWrapper(props: Props): JSX.Element {
  return (
    <>
      {/* Language toggle at chapter start (constitutional requirement) */}
      <LanguageToggle position="chapter-start" />

      {/* Original DocItem content */}
      <DocItem {...props} />
    </>
  );
}
```

---

## Step 7: Translate Content

Translate your first chapter to Urdu:

1. **Copy source file**:
   ```bash
   cp docs/intro.md i18n/ur/docusaurus-plugin-content-docs/current/intro.md
   ```

2. **Translate text content**:
   - Translate headings, paragraphs, and list items to Urdu
   - Keep code blocks, commands, and file paths in English
   - Translate code comments to Urdu

**Example**:

**Before** (English):
```markdown
# Introduction to Physical AI

This textbook teaches you about robotics and AI integration.

## What You Will Learn

- ROS 2 fundamentals
- Gazebo simulation
- NVIDIA Isaac platform
```

**After** (Urdu):
```markdown
# فزیکل AI کا تعارف

یہ نصابی کتاب آپ کو روبوٹکس اور AI کے انضمام کے بارے میں سکھاتی ہے۔

## آپ کیا سیکھیں گے

- ROS 2 بنیادی باتیں
- Gazebo سمیولیشن
- NVIDIA Isaac پلیٹ فارم
```

---

## Step 8: Test the Implementation

1. **Build with Urdu locale**:
   ```bash
   npm run build
   ```

2. **Serve locally**:
   ```bash
   npm run serve
   ```

3. **Test checklist**:
   - [ ] Navigate to `http://localhost:3000/` (English version)
   - [ ] Click language toggle button, select "اردو"
   - [ ] Verify URL changes to `/ur/`
   - [ ] Verify text flows right-to-left
   - [ ] Verify code blocks remain left-to-right
   - [ ] Navigate to another page
   - [ ] Verify language preference persists
   - [ ] Refresh page
   - [ ] Verify Urdu still selected (localStorage persistence)

---

## Step 9: Deploy with Multi-Locale Support

Update your build/deploy script to generate both locales:

**GitHub Actions Example** (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build all locales
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

---

## Troubleshooting

### Language toggle not appearing
- Verify `DocItem` was swizzled correctly
- Check browser console for React errors
- Ensure `LanguageToggle` component is imported correctly

### RTL layout not applied
- Verify `rtl.css` is imported in `custom.css`
- Check browser DevTools for `html[dir='rtl']` attribute
- Clear browser cache and hard refresh

### Code blocks still RTL
- Verify CSS specificity for `html[dir='rtl'] pre, html[dir='rtl'] code`
- Add `!important` if necessary: `direction: ltr !important;`

### Translation not found
- Verify file path matches source: `i18n/ur/docusaurus-plugin-content-docs/current/[path]`
- Check file extensions (.md, not .mdx if source is .md)
- Rebuild the site

### Language preference not persisting
- Check browser localStorage support (not available in incognito mode)
- Verify `localStorage.setItem('docusaurus.locale', ...)` is called
- Check browser DevTools → Application → Local Storage

---

## Next Steps

1. **Translate more content**: Start with high-priority pages (Module 1 intro, etc.)
2. **Add translation status indicators**: Show completeness badges
3. **Set up CI/CD validation**: Check for missing/outdated translations
4. **Document translation guidelines**: Create contributor guide for community translators
5. **Test accessibility**: Verify WCAG 2.1 AA compliance with screen readers

---

## Additional Resources

- [Docusaurus i18n Documentation](https://docusaurus.io/docs/i18n/introduction)
- [RTL Layout Best Practices](https://rtlstyling.com/)
- [Urdu Typography Guidelines](https://en.wikipedia.org/wiki/Urdu_Nastaliq)
- [BCP 47 Language Tags](https://www.w3.org/International/articles/language-tags/)

---

## Support

For issues or questions:
- Check the [Docusaurus i18n tutorial](https://docusaurus.io/docs/i18n/tutorial)
- Review the [feature specification](./spec.md)
- Consult the [implementation plan](./plan.md)
- Open an issue in the GitHub repository
