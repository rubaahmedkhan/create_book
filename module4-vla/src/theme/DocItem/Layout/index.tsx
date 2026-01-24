/**
 * DocItem Layout Wrapper
 * Feature: 002-urdu-translation
 *
 * Wraps the default DocItem Layout to inject LanguageToggle component
 * at the start of each chapter (constitutional requirement).
 */

import React, { useCallback, useEffect } from 'react';
import DocItemLayout from '@theme-original/DocItem/Layout';
import type DocItemLayoutType from '@theme/DocItem/Layout';
import type { WrapperProps } from '@docusaurus/types';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import LanguageToggle from '../../LanguageToggle';
import type { LocaleConfig } from '../../LanguageToggle/types';
import {
  saveLanguagePreference,
  navigateToLocale,
  applyDirection,
  emitLanguageChangeEvent,
  getLocaleFromPath,
} from '../../LanguageToggle/utils';

type Props = WrapperProps<typeof DocItemLayoutType>;

/**
 * Wrapped DocItem Layout Component
 *
 * Adds language selection toggle at the start of each documentation page.
 * This satisfies the constitutional requirement:
 * "Each chapter MUST include a prominent language selection button at the start."
 */
export default function DocItemLayoutWrapper(props: Props): JSX.Element {
  const { i18n, siteConfig } = useDocusaurusContext();
  const location = useLocation();

  // Convert Docusaurus locale configs to LocaleConfig format
  const availableLocales: LocaleConfig[] = i18n.locales.map((locale) => {
    const config = i18n.localeConfigs[locale];
    return {
      code: locale,
      label: config?.label || locale,
      direction: (config?.direction as 'ltr' | 'rtl') || 'ltr',
      htmlLang: config?.htmlLang || locale,
      // Optional: Add flags for better UX
      flag: locale === 'en' ? '🇬🇧' : locale === 'ur' ? '🇵🇰' : undefined,
    };
  });

  const currentLocale = i18n.currentLocale;
  const currentLocaleConfig = availableLocales.find(
    (locale) => locale.code === currentLocale
  );

  // Handle language change
  const handleLanguageChange = useCallback(
    (newLocale: string) => {
      const newLocaleConfig = availableLocales.find(
        (locale) => locale.code === newLocale
      );

      if (!newLocaleConfig) {
        console.warn(`Locale ${newLocale} not found in available locales`);
        return;
      }

      // Save preference to localStorage
      saveLanguagePreference(newLocale, newLocaleConfig.direction);

      // Emit language change event
      emitLanguageChangeEvent(currentLocale, newLocale, 'user');

      // Apply direction attribute
      applyDirection(newLocaleConfig.direction);

      // Navigate to the new locale
      navigateToLocale(newLocale, siteConfig.baseUrl);
    },
    [currentLocale, availableLocales, siteConfig.baseUrl]
  );

  // Apply direction on mount and when locale changes
  useEffect(() => {
    if (currentLocaleConfig) {
      applyDirection(currentLocaleConfig.direction);
    }
  }, [currentLocaleConfig]);

  return (
    <>
      {/* Language toggle at chapter start (constitutional requirement) */}
      <LanguageToggle
        currentLocale={currentLocale}
        availableLocales={availableLocales}
        onLanguageChange={handleLanguageChange}
        displayMode="button"
        position="chapter-start"
      />

      {/* Original DocItem Layout */}
      <DocItemLayout {...props} />
    </>
  );
}
