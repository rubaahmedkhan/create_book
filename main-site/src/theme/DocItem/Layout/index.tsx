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

/** Skill level section emojis in content headings */
const LEVEL_EMOJIS: Record<string, string> = {
  beginner: '🟢',
  intermediate: '🟡',
  advanced: '🔴',
};

/**
 * Show only the heading sections that match the selected skill level.
 * Sections are marked by h2 headings containing 🟢 🟡 🔴 emojis.
 */
function applySkillLevelFilter(level: string | null): void {
  const article = document.querySelector('article');
  if (!article) return;

  const allH2s = Array.from(article.querySelectorAll('h2')) as HTMLElement[];
  const levelEmojis = Object.values(LEVEL_EMOJIS);

  // Find headings that mark skill-level sections
  const levelH2s = allH2s.filter((h2) =>
    levelEmojis.some((e) => h2.textContent?.includes(e))
  );

  if (levelH2s.length === 0) return; // No level sections in this page — show all

  const targetEmoji = level ? LEVEL_EMOJIS[level] : null;

  levelH2s.forEach((h2) => {
    const isSelected = targetEmoji ? h2.textContent?.includes(targetEmoji) : true;
    const display = isSelected ? '' : 'none';

    h2.style.display = display;

    // Hide/show all siblings until the next level-marked h2
    let sibling = h2.nextElementSibling as HTMLElement | null;
    while (sibling) {
      const isNextLevelH2 =
        sibling.tagName === 'H2' &&
        levelEmojis.some((e) => sibling.textContent?.includes(e));

      if (isNextLevelH2) break;
      sibling.style.display = display;
      sibling = sibling.nextElementSibling as HTMLElement | null;
    }
  });
}

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

      // Navigate to the new locale (checks if translation exists)
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

  // Apply skill-level content filter on every page render
  useEffect(() => {
    const runFilter = () => {
      const stored = localStorage.getItem('userSkillLevel');
      applySkillLevelFilter(stored);
    };

    // Wait for Docusaurus to finish rendering the article content
    const timer = setTimeout(runFilter, 200);
    return () => clearTimeout(timer);
  }, [location.pathname]);

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
