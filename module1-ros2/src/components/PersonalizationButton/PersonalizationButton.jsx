import React, { useState, useEffect } from 'react';
import styles from './PersonalizationButton.module.css';

/**
 * PersonalizationButton Component
 *
 * A floating button that allows users to toggle content personalization
 * based on their skill level (beginner/intermediate/advanced).
 *
 * When clicked, it shows/hides content sections marked with data-skill-level attributes.
 */
export default function PersonalizationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [skillLevel, setSkillLevel] = useState(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [background, setBackground] = useState(null);

  useEffect(() => {
    // Get user's skill level from localStorage (set by AuthGuard)
    const storedLevel = localStorage.getItem('userSkillLevel');
    const storedBackground = localStorage.getItem('userBackground');

    if (storedLevel) {
      setSkillLevel(storedLevel);
    }
    if (storedBackground) {
      setBackground(storedBackground);
    }

    // Check if personalization was previously enabled
    const personalized = localStorage.getItem('contentPersonalized') === 'true';
    setIsPersonalized(personalized);

    // Apply personalization if it was enabled
    if (personalized && storedLevel) {
      applyPersonalization(storedLevel);
    }
  }, []);

  const togglePersonalization = () => {
    const newState = !isPersonalized;
    setIsPersonalized(newState);
    localStorage.setItem('contentPersonalized', String(newState));

    if (newState && skillLevel) {
      applyPersonalization(skillLevel);
    } else {
      removePersonalization();
    }

    setIsOpen(false);
  };

  const applyPersonalization = (level) => {
    // Add a class to the body for CSS-based personalization
    document.body.classList.add('personalized-content');
    document.body.setAttribute('data-user-skill-level', level);

    // Show content for user's level and below, hide higher level content
    const levelOrder = ['beginner', 'intermediate', 'advanced'];
    const userLevelIndex = levelOrder.indexOf(level);

    // Find all elements with data-skill-level attribute
    const skillElements = document.querySelectorAll('[data-skill-level]');

    skillElements.forEach((el) => {
      const elementLevel = el.getAttribute('data-skill-level');
      const elementLevelIndex = levelOrder.indexOf(elementLevel);

      if (elementLevelIndex <= userLevelIndex) {
        // Show content at or below user's level
        el.classList.remove(styles.hiddenContent);
        el.classList.add(styles.highlightedContent);
      } else {
        // Hide content above user's level (but keep visible with indicator)
        el.classList.add(styles.advancedContent);
      }
    });

    // Highlight recommended sections
    const recommendedElements = document.querySelectorAll(`[data-recommended-for="${level}"]`);
    recommendedElements.forEach((el) => {
      el.classList.add(styles.recommendedContent);
    });

    // Show notification
    showNotification(`Content personalized for ${level} level`);
  };

  const removePersonalization = () => {
    document.body.classList.remove('personalized-content');
    document.body.removeAttribute('data-user-skill-level');

    // Remove all personalization classes
    const elements = document.querySelectorAll('[data-skill-level], [data-recommended-for]');
    elements.forEach((el) => {
      el.classList.remove(styles.hiddenContent, styles.highlightedContent, styles.advancedContent, styles.recommendedContent);
    });

    showNotification('Showing all content');
  };

  const showNotification = (message) => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = styles.notification;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after animation
    setTimeout(() => {
      notification.classList.add(styles.fadeOut);
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  };

  const getSkillLevelEmoji = () => {
    const emojis = {
      beginner: '🌱',
      intermediate: '🌿',
      advanced: '🌳',
    };
    return emojis[skillLevel] || '📚';
  };

  const getSkillLevelColor = () => {
    const colors = {
      beginner: '#22c55e',
      intermediate: '#3b82f6',
      advanced: '#8b5cf6',
    };
    return colors[skillLevel] || '#6b7280';
  };

  if (!skillLevel) {
    return null; // Don't show button if user profile not loaded
  }

  return (
    <>
      {/* Floating Button */}
      <button
        className={styles.floatingButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Personalize Content"
        style={{ backgroundColor: isPersonalized ? getSkillLevelColor() : '#6b7280' }}
      >
        {isPersonalized ? getSkillLevelEmoji() : '⚙️'}
      </button>

      {/* Popup Menu */}
      {isOpen && (
        <div className={styles.popup}>
          <div className={styles.popupHeader}>
            <h3>Content Personalization</h3>
            <button onClick={() => setIsOpen(false)} className={styles.closeButton}>
              ×
            </button>
          </div>

          <div className={styles.popupBody}>
            <div className={styles.profileInfo}>
              <div className={styles.skillBadge} style={{ backgroundColor: getSkillLevelColor() }}>
                {getSkillLevelEmoji()} {skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)}
              </div>
              {background && (
                <div className={styles.backgroundBadge}>
                  {background === 'software' ? '💻' : background === 'hardware' ? '🔧' : '🚀'}{' '}
                  {background.charAt(0).toUpperCase() + background.slice(1)}
                </div>
              )}
            </div>

            <p className={styles.description}>
              {isPersonalized
                ? `Content is optimized for your ${skillLevel} skill level. Advanced topics are marked but still visible.`
                : 'Click below to personalize content based on your skill level. Recommended sections will be highlighted.'}
            </p>

            <button
              className={`${styles.toggleButton} ${isPersonalized ? styles.active : ''}`}
              onClick={togglePersonalization}
            >
              {isPersonalized ? '🔓 Show All Content' : '✨ Personalize Content'}
            </button>
          </div>

          <div className={styles.popupFooter}>
            <a href="http://localhost:3001/dashboard" className={styles.dashboardLink}>
              ← Back to Dashboard
            </a>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && <div className={styles.backdrop} onClick={() => setIsOpen(false)} />}
    </>
  );
}
