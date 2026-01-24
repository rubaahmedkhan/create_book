/**
 * LanguageToggle Component
 * Feature: 002-urdu-translation
 *
 * Provides a UI element for users to switch between available languages.
 * Supports button and dropdown display modes with RTL awareness.
 */

import React, { useState, useCallback } from 'react';
import type {
  LanguageToggleProps,
  LocaleConfig,
} from './types';
import './styles.module.css';

/**
 * LanguageToggle Component
 *
 * Constitutional requirement: Each chapter MUST include a prominent language
 * selection button/dropdown at the start.
 *
 * @param props - Component properties following LanguageToggleProps interface
 */
const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLocale,
  availableLocales,
  onLanguageChange,
  displayMode = 'button',
  position = 'chapter-start',
  className = '',
  showTranslationStatus = false,
}) => {
  // State for dropdown open/close
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get current locale configuration
  const currentLocaleConfig = availableLocales.find(
    (locale) => locale.code === currentLocale
  );

  // Handle language selection
  const handleLanguageSelect = useCallback(
    (localeCode: string) => {
      if (localeCode !== currentLocale) {
        onLanguageChange(localeCode);
      }
      setIsDropdownOpen(false);
    },
    [currentLocale, onLanguageChange]
  );

  // Handle keyboard navigation for accessibility
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, localeCode: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleLanguageSelect(localeCode);
      }
    },
    [handleLanguageSelect]
  );

  // Toggle dropdown visibility
  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  // Render button mode (default for chapter-start position)
  if (displayMode === 'button') {
    return (
      <div
        className={`language-toggle language-toggle--button language-toggle--${position} ${className}`}
        role="group"
        aria-label="Language selection"
      >
        {availableLocales.map((locale) => {
          const isActive = locale.code === currentLocale;
          const buttonClass = [
            'language-toggle__button',
            isActive && 'language-toggle__button--active',
            locale.direction === 'rtl' && 'language-toggle__button--rtl',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={locale.code}
              className={buttonClass}
              onClick={() => handleLanguageSelect(locale.code)}
              onKeyDown={(e) => handleKeyDown(e, locale.code)}
              aria-label={`Switch to ${locale.label}`}
              aria-pressed={isActive}
              disabled={isActive}
              type="button"
              dir={locale.direction}
            >
              {locale.flag && (
                <span
                  className="language-toggle__flag"
                  aria-hidden="true"
                >
                  {locale.flag}
                </span>
              )}
              <span className="language-toggle__label">
                {locale.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Render dropdown mode (for header/sidebar positions)
  return (
    <div
      className={`language-toggle language-toggle--dropdown language-toggle--${position} ${className}`}
    >
      <button
        className="language-toggle__dropdown-trigger"
        onClick={toggleDropdown}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsDropdownOpen(false);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={isDropdownOpen}
        aria-label="Select language"
        type="button"
      >
        {currentLocaleConfig?.flag && (
          <span
            className="language-toggle__flag"
            aria-hidden="true"
          >
            {currentLocaleConfig.flag}
          </span>
        )}
        <span className="language-toggle__current-label">
          {currentLocaleConfig?.label || currentLocale}
        </span>
        <svg
          className="language-toggle__dropdown-arrow"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path
            d="M2 4l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <div
          className="language-toggle__dropdown-menu"
          role="listbox"
          aria-label="Available languages"
        >
          {availableLocales.map((locale) => {
            const isActive = locale.code === currentLocale;
            const optionClass = [
              'language-toggle__dropdown-option',
              isActive && 'language-toggle__dropdown-option--active',
              locale.direction === 'rtl' && 'language-toggle__dropdown-option--rtl',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={locale.code}
                className={optionClass}
                onClick={() => handleLanguageSelect(locale.code)}
                onKeyDown={(e) => handleKeyDown(e, locale.code)}
                role="option"
                aria-selected={isActive}
                type="button"
                dir={locale.direction}
              >
                {locale.flag && (
                  <span
                    className="language-toggle__flag"
                    aria-hidden="true"
                  >
                    {locale.flag}
                  </span>
                )}
                <span className="language-toggle__label">
                  {locale.label}
                </span>
                {isActive && (
                  <svg
                    className="language-toggle__checkmark"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path
                      d="M13 4L6 11 3 8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      {showTranslationStatus && (
        <div
          className="language-toggle__status-hint"
          role="status"
          aria-live="polite"
        >
          Translation status indicator (User Story 4)
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
