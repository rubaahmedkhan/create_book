import React, { useEffect, useState } from 'react';

/**
 * SkillContent Component
 *
 * Shows/highlights content based on user's skill level.
 * Reads skill level from URL parameter (?level=beginner|intermediate|advanced)
 * and stores it in localStorage for persistence.
 *
 * Usage in MDX:
 * <SkillContent level="beginner">
 *   Content for beginners...
 * </SkillContent>
 *
 * <SkillContent level="intermediate">
 *   Content for intermediate learners...
 * </SkillContent>
 *
 * <SkillContent level="advanced">
 *   Content for advanced learners...
 * </SkillContent>
 */

const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'];

const skillColors = {
  beginner: {
    border: '#22c55e',
    bg: '#f0fdf4',
    badge: '#16a34a',
    label: 'Beginner'
  },
  intermediate: {
    border: '#3b82f6',
    bg: '#eff6ff',
    badge: '#2563eb',
    label: 'Intermediate'
  },
  advanced: {
    border: '#a855f7',
    bg: '#faf5ff',
    badge: '#9333ea',
    label: 'Advanced'
  }
};

function getSkillLevel() {
  // First check URL parameter
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLevel = urlParams.get('level');
    if (urlLevel && SKILL_LEVELS.includes(urlLevel)) {
      // Store in localStorage for persistence
      localStorage.setItem('userSkillLevel', urlLevel);
      return urlLevel;
    }

    // Fall back to localStorage
    const storedLevel = localStorage.getItem('userSkillLevel');
    if (storedLevel && SKILL_LEVELS.includes(storedLevel)) {
      return storedLevel;
    }
  }

  // Default to showing all content
  return null;
}

export default function SkillContent({ level, children }) {
  const [userLevel, setUserLevel] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setUserLevel(getSkillLevel());

    // Listen for URL changes (for SPA navigation)
    const handleUrlChange = () => {
      setUserLevel(getSkillLevel());
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  if (!isClient) {
    // SSR: show all content
    return <div>{children}</div>;
  }

  const colors = skillColors[level] || skillColors.beginner;
  const isMatchingLevel = userLevel === level;
  const isHigherLevel = userLevel && SKILL_LEVELS.indexOf(level) <= SKILL_LEVELS.indexOf(userLevel);

  // If no user level set, show all content normally
  // If user level is set, highlight matching content and dim non-matching
  const shouldHighlight = !userLevel || isMatchingLevel;
  const shouldShow = !userLevel || isHigherLevel;

  if (!shouldShow) {
    // Completely hide content above user's level
    // User can only see content at their level or below
    return null;
  }

  return (
    <div
      style={{
        margin: '1rem 0',
        padding: '1rem',
        borderLeft: `4px solid ${colors.border}`,
        backgroundColor: shouldHighlight ? colors.bg : '#f9fafb',
        borderRadius: '0 8px 8px 0',
        opacity: shouldHighlight ? 1 : 0.7,
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ marginBottom: '0.5rem' }}>
        <span style={{
          display: 'inline-block',
          padding: '2px 10px',
          backgroundColor: colors.badge,
          color: 'white',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: '600',
        }}>
          {colors.label}
          {isMatchingLevel && ' - Your Level'}
        </span>
      </div>
      {children}
    </div>
  );
}

/**
 * SkillBanner Component
 *
 * Shows a banner at the top of the page indicating the user's skill level
 * and that content is personalized.
 */
export function SkillBanner() {
  const [userLevel, setUserLevel] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setUserLevel(getSkillLevel());
  }, []);

  if (!isClient || !userLevel) {
    return null;
  }

  const colors = skillColors[userLevel];

  return (
    <div style={{
      padding: '12px 20px',
      backgroundColor: colors.bg,
      borderBottom: `2px solid ${colors.border}`,
      marginBottom: '1rem',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          padding: '4px 12px',
          backgroundColor: colors.badge,
          color: 'white',
          borderRadius: '6px',
          fontWeight: '600',
          fontSize: '0.875rem',
        }}>
          {colors.label} Level
        </span>
        <span style={{ color: '#374151', fontSize: '0.875rem' }}>
          Content personalized for your experience level
        </span>
      </div>
      <button
        onClick={() => {
          localStorage.removeItem('userSkillLevel');
          window.location.href = window.location.pathname;
        }}
        style={{
          padding: '4px 12px',
          backgroundColor: 'transparent',
          border: `1px solid ${colors.border}`,
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.75rem',
          color: colors.badge,
        }}
      >
        Show All Content
      </button>
    </div>
  );
}
