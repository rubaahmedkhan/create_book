/**
 * Language Toggle Component Interface
 * Feature: 002-urdu-translation
 *
 * This file defines the TypeScript interfaces for the LanguageToggle component
 * and related data structures used for Urdu translation feature.
 */

/**
 * Props for the LanguageToggle component
 *
 * This component provides a UI element for users to switch between available languages.
 * It can be displayed as a button or dropdown and positioned in various locations.
 */
export interface LanguageToggleProps {
  /**
   * Current locale code (e.g., 'en', 'ur')
   * This should match one of the codes in availableLocales
   */
  currentLocale: string;

  /**
   * List of available locales with their display configuration
   * Each locale includes label, direction, and optional visual indicators
   */
  availableLocales: LocaleConfig[];

  /**
   * Callback function invoked when user selects a different language
   * @param locale - The newly selected locale code
   */
  onLanguageChange: (locale: string) => void;

  /**
   * Visual presentation mode for the toggle control
   * - 'button': Simple button(s) for direct language switching
   * - 'dropdown': Dropdown menu for selecting from available languages
   * @default 'button'
   */
  displayMode?: 'button' | 'dropdown';

  /**
   * Position of the language toggle in the page layout
   * - 'header': In the navigation header
   * - 'chapter-start': At the beginning of each chapter (constitutional requirement)
   * - 'sidebar': In the documentation sidebar
   * @default 'chapter-start'
   */
  position?: 'header' | 'chapter-start' | 'sidebar';

  /**
   * Optional CSS class name for custom styling
   */
  className?: string;

  /**
   * Optional flag to show/hide translation status indicator
   * @default false
   */
  showTranslationStatus?: boolean;
}

/**
 * Configuration for a single locale
 *
 * Defines how each language should be displayed and handled in the UI
 */
export interface LocaleConfig {
  /**
   * Locale code following ISO 639-1 standard (e.g., 'ur', 'en', 'ar')
   */
  code: string;

  /**
   * Display label in the native language (e.g., 'اردو' for Urdu, 'English' for English)
   * This is what users see in the language selector
   */
  label: string;

  /**
   * Text direction for this locale
   * - 'ltr': Left-to-right (English, Spanish, French)
   * - 'rtl': Right-to-left (Urdu, Arabic)
   */
  direction: 'ltr' | 'rtl';

  /**
   * HTML lang attribute value following BCP 47 format (e.g., 'ur-PK', 'en-US')
   * Used for proper HTML document language declaration
   */
  htmlLang: string;

  /**
   * Optional flag emoji or icon identifier for visual representation
   * Can be a Unicode emoji (e.g., '🇵🇰') or a path to an icon file
   */
  flag?: string;
}

/**
 * Translation status information for a specific page/document
 *
 * Provides metadata about the availability and quality of translations
 */
export interface TranslationStatus {
  /**
   * Whether a translation exists for the current page in the selected language
   */
  available: boolean;

  /**
   * Percentage of content translated (0-100)
   * 100 means fully translated, 0 means no translation available
   */
  completeness: number;

  /**
   * ISO 8601 date string of when the translation was last updated
   * Example: '2025-12-30T00:00:00Z'
   */
  lastUpdated: string;

  /**
   * Flag indicating if the source content was modified after the translation
   * True means the translation may be outdated
   */
  isOutdated: boolean;

  /**
   * Optional warning message to display to users
   * Used for outdated or incomplete translations
   */
  warning?: string;

  /**
   * Optional credit for translator(s)
   */
  translatorCredit?: string;

  /**
   * Review status of the translation
   */
  reviewStatus?: 'pending' | 'reviewed' | 'approved';
}

/**
 * Configuration for Docusaurus i18n plugin
 *
 * This interface mirrors the Docusaurus i18n configuration structure
 */
export interface I18nConfig {
  /**
   * Default locale to use when no preference is set
   * @default 'en'
   */
  defaultLocale: 'en';

  /**
   * Array of all supported locale codes
   * Must include defaultLocale
   */
  locales: string[];

  /**
   * Configuration for each supported locale
   * Key is the locale code, value is the locale configuration
   */
  localeConfigs: {
    [locale: string]: {
      /** Display label in native language */
      label: string;

      /** Text direction */
      direction: 'ltr' | 'rtl';

      /** HTML lang attribute */
      htmlLang: string;

      /** Optional: Calendar system for date formatting */
      calendar?: string;

      /** Optional: Path to custom locale data */
      path?: string;
    };
  };
}

/**
 * Language preference stored in browser localStorage
 *
 * Persists user's language selection across sessions
 */
export interface LanguagePreference {
  /** Selected locale code */
  locale: string;

  /** Text direction for the selected locale */
  direction: 'ltr' | 'rtl';

  /** Unix timestamp (milliseconds) when preference was set */
  timestamp: number;

  /** Optional: User's preferred display mode */
  displayMode?: 'button' | 'dropdown';
}

/**
 * Event payload for language change events
 */
export interface LanguageChangeEvent {
  /** Previous locale code */
  previousLocale: string;

  /** New locale code */
  newLocale: string;

  /** Timestamp of the change */
  timestamp: number;

  /** Source of the change (user action, URL parameter, localStorage, etc.) */
  source: 'user' | 'url' | 'storage' | 'default';
}

/**
 * Props for translation status indicator component
 */
export interface TranslationStatusIndicatorProps {
  /** Translation status information */
  status: TranslationStatus;

  /** Whether to show detailed information */
  detailed?: boolean;

  /** Callback when user clicks to contribute translation */
  onContributeClick?: () => void;
}

/**
 * Configuration for RTL (right-to-left) layout behavior
 */
export interface RTLConfig {
  /** Enable RTL layout for the locale */
  enabled: boolean;

  /** CSS class to apply for RTL mode */
  cssClass?: string;

  /** Elements that should remain LTR even in RTL mode (e.g., code blocks) */
  ltrExceptions?: string[];

  /** Mirror UI components (navigation, buttons) */
  mirrorUI?: boolean;
}
