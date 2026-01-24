/**
 * LanguageToggle Component Types
 * Feature: 002-urdu-translation
 *
 * Type definitions for the LanguageToggle component.
 */

/**
 * Configuration for a single locale
 */
export interface LocaleConfig {
  /** Locale code (e.g., 'en', 'ur') */
  code: string;

  /** Display label in native language */
  label: string;

  /** Text direction */
  direction: 'ltr' | 'rtl';

  /** HTML lang attribute */
  htmlLang: string;

  /** Optional flag emoji or icon */
  flag?: string;
}

/**
 * Props for the LanguageToggle component
 */
export interface LanguageToggleProps {
  /** Current locale code */
  currentLocale: string;

  /** List of available locales */
  availableLocales: LocaleConfig[];

  /** Callback when language changes */
  onLanguageChange: (locale: string) => void;

  /** Display mode */
  displayMode?: 'button' | 'dropdown';

  /** Position in layout */
  position?: 'header' | 'chapter-start' | 'sidebar';

  /** Optional CSS class */
  className?: string;

  /** Show translation status indicator */
  showTranslationStatus?: boolean;
}

/**
 * Language preference stored in localStorage
 */
export interface LanguagePreference {
  /** Selected locale code */
  locale: string;

  /** Text direction */
  direction: 'ltr' | 'rtl';

  /** Timestamp when preference was set */
  timestamp: number;

  /** Optional display mode preference */
  displayMode?: 'button' | 'dropdown';
}

/**
 * Event payload for language change events
 */
export interface LanguageChangeEvent {
  /** Previous locale */
  previousLocale: string;

  /** New locale */
  newLocale: string;

  /** Timestamp */
  timestamp: number;

  /** Source of change */
  source: 'user' | 'url' | 'storage' | 'default';
}
