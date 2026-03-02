/**
 * Language Toggle Utilities
 * Feature: 002-urdu-translation
 *
 * Provides localStorage persistence, locale detection, and URL handling
 * for language preferences.
 */

import type {
  LanguagePreference,
  LanguageChangeEvent,
} from './types';

// localStorage key for language preference
const LANGUAGE_PREFERENCE_KEY = 'docusaurus.languagePreference';

// Custom event name for language changes
const LANGUAGE_CHANGE_EVENT = 'languageChange';

/**
 * Save language preference to localStorage
 *
 * Stores the user's language selection persistently in the browser.
 * This allows the preference to persist across page reloads and sessions.
 *
 * @param locale - The locale code to save (e.g., 'en', 'ur')
 * @param direction - Text direction for the locale ('ltr' or 'rtl')
 * @param displayMode - Optional display mode preference
 */
export function saveLanguagePreference(
  locale: string,
  direction: 'ltr' | 'rtl',
  displayMode?: 'button' | 'dropdown'
): void {
  if (typeof window === 'undefined') {
    return; // Skip on server-side rendering
  }

  const preference: LanguagePreference = {
    locale,
    direction,
    timestamp: Date.now(),
    displayMode,
  };

  try {
    localStorage.setItem(LANGUAGE_PREFERENCE_KEY, JSON.stringify(preference));
  } catch (error) {
    console.warn('Failed to save language preference to localStorage:', error);
  }
}

/**
 * Load language preference from localStorage
 *
 * Retrieves the previously saved language preference.
 * Returns null if no preference exists or if there's an error.
 *
 * @returns The saved language preference or null
 */
export function loadLanguagePreference(): LanguagePreference | null {
  if (typeof window === 'undefined') {
    return null; // Skip on server-side rendering
  }

  try {
    const stored = localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
    if (!stored) {
      return null;
    }

    const preference: LanguagePreference = JSON.parse(stored);

    // Validate the stored data structure
    if (
      typeof preference.locale === 'string' &&
      (preference.direction === 'ltr' || preference.direction === 'rtl') &&
      typeof preference.timestamp === 'number'
    ) {
      return preference;
    }

    // Invalid data structure, remove it
    localStorage.removeItem(LANGUAGE_PREFERENCE_KEY);
    return null;
  } catch (error) {
    console.warn('Failed to load language preference from localStorage:', error);
    return null;
  }
}

/**
 * Clear language preference from localStorage
 *
 * Removes the saved preference, causing the system to fall back
 * to the default locale.
 */
export function clearLanguagePreference(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(LANGUAGE_PREFERENCE_KEY);
  } catch (error) {
    console.warn('Failed to clear language preference from localStorage:', error);
  }
}

/**
 * Get locale from URL path
 *
 * Extracts the locale code from the current URL path.
 * Docusaurus uses URL structure like: /[locale]/[path]
 *
 * @param pathname - The URL pathname (default: window.location.pathname)
 * @returns The locale code or null if not found
 */
export function getLocaleFromPath(pathname?: string): string | null {
  if (typeof window === 'undefined' && !pathname) {
    return null;
  }

  const path = pathname || window.location.pathname;

  // Require a trailing slash or end-of-string after the 2-letter code so that
  // /create_book/... does NOT incorrectly match 'cr'.
  const match = path.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(\/|$)/);
  return match ? match[1] : null;
}

/**
 * Build localized URL
 *
 * Constructs a URL with the specified locale prefix.
 * Handles both absolute and relative paths.
 *
 * @param locale - The target locale code
 * @param currentPath - The current pathname (default: window.location.pathname)
 * @param baseUrl - The base URL for the site (default: '/')
 * @returns The localized URL path
 */
export function buildLocalizedUrl(
  locale: string,
  currentPath?: string,
  baseUrl: string = '/'
): string {
  if (typeof window === 'undefined' && !currentPath) {
    return '/';
  }

  const path = currentPath || window.location.pathname;
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  // Strip the baseUrl prefix FIRST so getLocaleFromPath sees /ur/intro, not /module4/ur/intro
  let relativePath = path;
  if (cleanBaseUrl && path.startsWith(cleanBaseUrl)) {
    relativePath = path.slice(cleanBaseUrl.length) || '/';
  }

  // Detect and remove any existing locale prefix from the relative path
  const currentLocale = getLocaleFromPath(relativePath);
  if (currentLocale) {
    relativePath = relativePath.replace(new RegExp(`^/${currentLocale}(/|$)`), '/');
  }

  if (!relativePath.startsWith('/')) {
    relativePath = '/' + relativePath;
  }

  // For default locale, don't add locale prefix (Docusaurus convention)
  if (locale === 'en') {
    return `${cleanBaseUrl}${relativePath}`;
  }

  // Add new locale prefix
  return `${cleanBaseUrl}/${locale}${relativePath}`;
}

/**
 * Navigate to localized URL
 *
 * Performs a client-side navigation to the specified locale version
 * of the current page. Updates the browser history.
 *
 * @param locale - The target locale code
 * @param baseUrl - The base URL for the site (default: '/')
 */
export function navigateToLocale(locale: string, baseUrl: string = '/'): void {
  if (typeof window === 'undefined') {
    return;
  }

  const localizedUrl = buildLocalizedUrl(locale, window.location.pathname, baseUrl);
  const fullUrl = `${localizedUrl}${window.location.search}${window.location.hash}`;

  window.location.href = fullUrl;
}

/**
 * Apply RTL direction to HTML element
 *
 * Updates the document's HTML element with the appropriate direction attribute.
 * This is essential for proper RTL layout rendering.
 *
 * @param direction - The text direction ('ltr' or 'rtl')
 */
export function applyDirection(direction: 'ltr' | 'rtl'): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  document.documentElement.setAttribute('dir', direction);
}

/**
 * Detect browser language preference
 *
 * Returns the user's browser language preference if it matches
 * one of the available locales.
 *
 * @param availableLocales - Array of supported locale codes
 * @returns Detected locale code or null
 */
export function detectBrowserLanguage(availableLocales: string[]): string | null {
  if (typeof window === 'undefined' || !navigator.language) {
    return null;
  }

  // Get browser language (e.g., 'en-US', 'ur-PK')
  const browserLang = navigator.language.toLowerCase();

  // Try exact match first
  if (availableLocales.includes(browserLang)) {
    return browserLang;
  }

  // Try matching just the language code (e.g., 'en' from 'en-US')
  const langCode = browserLang.split('-')[0];
  if (availableLocales.includes(langCode)) {
    return langCode;
  }

  return null;
}

/**
 * Emit language change event
 *
 * Dispatches a custom event when the language changes.
 * This allows other components to react to language changes.
 *
 * @param previousLocale - The previous locale code
 * @param newLocale - The new locale code
 * @param source - The source of the change
 */
export function emitLanguageChangeEvent(
  previousLocale: string,
  newLocale: string,
  source: 'user' | 'url' | 'storage' | 'default'
): void {
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') {
    return;
  }

  const eventPayload: LanguageChangeEvent = {
    previousLocale,
    newLocale,
    timestamp: Date.now(),
    source,
  };

  const event = new CustomEvent(LANGUAGE_CHANGE_EVENT, {
    detail: eventPayload,
    bubbles: true,
  });

  window.dispatchEvent(event);
}

/**
 * Subscribe to language change events
 *
 * Adds a listener for language change events.
 *
 * @param callback - Function to call when language changes
 * @returns Cleanup function to remove the listener
 */
export function onLanguageChange(
  callback: (event: LanguageChangeEvent) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event: Event) => {
    if (event instanceof CustomEvent) {
      callback(event.detail);
    }
  };

  window.addEventListener(LANGUAGE_CHANGE_EVENT, handler);

  // Return cleanup function
  return () => {
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, handler);
  };
}

/**
 * Get preferred locale with fallback chain
 *
 * Determines the best locale to use based on:
 * 1. URL path locale
 * 2. localStorage preference
 * 3. Browser language detection
 * 4. Default locale
 *
 * @param availableLocales - Array of supported locale codes
 * @param defaultLocale - The fallback locale (default: 'en')
 * @returns The determined locale code
 */
export function getPreferredLocale(
  availableLocales: string[],
  defaultLocale: string = 'en'
): string {
  // Priority 1: URL path locale
  const urlLocale = getLocaleFromPath();
  if (urlLocale && availableLocales.includes(urlLocale)) {
    return urlLocale;
  }

  // Priority 2: localStorage preference
  const storedPreference = loadLanguagePreference();
  if (storedPreference && availableLocales.includes(storedPreference.locale)) {
    return storedPreference.locale;
  }

  // Priority 3: Browser language detection
  const browserLocale = detectBrowserLanguage(availableLocales);
  if (browserLocale) {
    return browserLocale;
  }

  // Priority 4: Default locale
  return defaultLocale;
}
