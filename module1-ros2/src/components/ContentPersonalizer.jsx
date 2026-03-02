import React, { useEffect, useState } from 'react';

/**
 * ContentPersonalizer Component
 *
 * Automatically detects skill level sections in the page content based on headings:
 * - 🟢 Beginner Level
 * - 🟡 Intermediate Level
 * - 🔴 Advanced Level
 *
 * And shows/hides content based on user's skill level.
 */

const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'];

const LEVEL_PATTERNS = {
  beginner: /🟢.*beginner/i,
  intermediate: /🟡.*intermediate/i,
  advanced: /🔴.*advanced/i
};

export default function ContentPersonalizer() {
  const [userLevel, setUserLevel] = useState(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [sectionsFound, setSectionsFound] = useState(0);

  useEffect(() => {
    // Get user skill level
    const urlParams = new URLSearchParams(window.location.search);
    const urlLevel = urlParams.get('level');
    const storedLevel = localStorage.getItem('userSkillLevel');

    const level = urlLevel || storedLevel;
    if (level && SKILL_LEVELS.includes(level)) {
      setUserLevel(level);

      // Check if personalization is enabled
      const personalized = localStorage.getItem('contentPersonalized') === 'true';
      setIsPersonalized(personalized);

      // Auto-apply personalization on page load
      if (personalized) {
        setTimeout(() => applyPersonalization(level), 500);
      }
    }

    // Listen for personalization toggle
    const handleStorage = (e) => {
      if (e.key === 'contentPersonalized') {
        const newState = e.newValue === 'true';
        setIsPersonalized(newState);
        if (newState && userLevel) {
          applyPersonalization(userLevel);
        } else {
          removePersonalization();
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [userLevel]);

  const applyPersonalization = (level) => {
    const userLevelIndex = SKILL_LEVELS.indexOf(level);
    let count = 0;

    // Find all headings that indicate skill level
    const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

    allHeadings.forEach((heading) => {
      const text = heading.textContent || '';
      let sectionLevel = null;

      // Detect which level this heading represents
      for (const [lvl, pattern] of Object.entries(LEVEL_PATTERNS)) {
        if (pattern.test(text)) {
          sectionLevel = lvl;
          break;
        }
      }

      if (sectionLevel) {
        count++;
        const sectionLevelIndex = SKILL_LEVELS.indexOf(sectionLevel);

        // Get all content until the next same-level heading
        let element = heading;
        const elementsToProcess = [heading];

        while (element.nextElementSibling) {
          const next = element.nextElementSibling;
          const tagName = next.tagName.toLowerCase();

          // Stop if we hit another heading of same or higher importance
          if (['h1', 'h2'].includes(tagName)) {
            const nextText = next.textContent || '';
            // Check if it's another skill level section
            for (const pattern of Object.values(LEVEL_PATTERNS)) {
              if (pattern.test(nextText)) {
                break;
              }
            }
            break;
          }

          elementsToProcess.push(next);
          element = next;
        }

        // Apply styling based on user's level
        elementsToProcess.forEach((el) => {
          if (sectionLevelIndex > userLevelIndex) {
            // Content above user's level - collapse/dim it
            el.classList.add('skill-above-level');
            el.setAttribute('data-skill-level', sectionLevel);
          } else if (sectionLevelIndex === userLevelIndex) {
            // Matching level - highlight
            el.classList.add('skill-matching-level');
            el.setAttribute('data-skill-level', sectionLevel);
          } else {
            // Below user's level - show normally
            el.classList.add('skill-below-level');
            el.setAttribute('data-skill-level', sectionLevel);
          }
        });
      }
    });

    setSectionsFound(count);

    // Add personalization styles
    addPersonalizationStyles();
  };

  const removePersonalization = () => {
    // Remove all skill level classes
    document.querySelectorAll('.skill-above-level, .skill-matching-level, .skill-below-level')
      .forEach((el) => {
        el.classList.remove('skill-above-level', 'skill-matching-level', 'skill-below-level');
        el.removeAttribute('data-skill-level');
      });
  };

  const addPersonalizationStyles = () => {
    const styleId = 'content-personalizer-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Matching level - highlight */
      .skill-matching-level {
        position: relative;
      }

      h2.skill-matching-level,
      h3.skill-matching-level {
        background: linear-gradient(90deg, rgba(34, 197, 94, 0.15) 0%, transparent 100%);
        padding-left: 16px;
        margin-left: -16px;
        border-left: 4px solid #22c55e;
        border-radius: 0 8px 8px 0;
      }

      /* Above user's level - dim and collapse */
      .skill-above-level {
        opacity: 0.5;
        position: relative;
      }

      h2.skill-above-level,
      h3.skill-above-level {
        background: linear-gradient(90deg, rgba(168, 85, 247, 0.1) 0%, transparent 100%);
        padding-left: 16px;
        margin-left: -16px;
        border-left: 4px solid #a855f7;
        border-radius: 0 8px 8px 0;
        cursor: pointer;
      }

      h2.skill-above-level::after,
      h3.skill-above-level::after {
        content: ' (Advanced - Click to expand)';
        font-size: 0.7em;
        color: #a855f7;
        font-weight: normal;
      }

      /* Below user's level - normal display */
      .skill-below-level {
        opacity: 1;
      }

      /* Notification badge */
      .personalization-active-badge {
        position: fixed;
        top: 80px;
        right: 24px;
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        animation: slideIn 0.3s ease;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    document.head.appendChild(style);
  };

  // Don't render anything visible - this component just manages the DOM
  return null;
}
