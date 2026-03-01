import React, { useState, useEffect, useCallback } from 'react';

/**
 * PersonalizationButton Component
 *
 * Floating button that shows current skill level and allows changing it.
 * - Reads level from URL param (?level=) on first load, saves to localStorage
 * - Falls back to fetching from backend profile API
 * - Hides/shows content sections (🟢 Beginner / 🟡 Intermediate / 🔴 Advanced)
 * - Reloads page when level is changed
 */

const BACKEND_URL = 'http://localhost:8000';
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'];

const skillConfig = {
  beginner: {
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#7c3aed',
    emoji: '🌱',
    label: 'Beginner',
    sectionEmoji: '🟢',
    description: 'Foundation concepts with detailed explanations',
  },
  intermediate: {
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#7c3aed',
    emoji: '🚀',
    label: 'Intermediate',
    sectionEmoji: '🟡',
    description: 'Practical skills with real-world examples',
  },
  advanced: {
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#7c3aed',
    emoji: '⚡',
    label: 'Advanced',
    sectionEmoji: '🔴',
    description: 'Advanced techniques and optimizations',
  },
};

/**
 * Hide/show content sections based on selected skill level.
 * Sections are identified by h2 headings containing 🟢 🟡 🔴 emojis.
 */
function applyContentFilter(level) {
  if (!level) return;

  const config = skillConfig[level];
  if (!config) return;

  const article = document.querySelector('article');
  if (!article) return;

  const allH2s = Array.from(article.querySelectorAll('h2'));

  // Find level headings (those with 🟢 🟡 🔴)
  const levelEmojis = ['🟢', '🟡', '🔴'];
  const levelH2s = allH2s.filter((h2) =>
    levelEmojis.some((e) => h2.textContent.includes(e))
  );

  if (levelH2s.length === 0) return; // No level sections — show all

  levelH2s.forEach((h2) => {
    const isSelected = h2.textContent.includes(config.sectionEmoji);
    const display = isSelected ? '' : 'none';

    h2.style.display = display;

    let sibling = h2.nextElementSibling;
    while (sibling) {
      const isNextLevelH2 =
        sibling.tagName === 'H2' &&
        levelEmojis.some((e) => sibling.textContent.includes(e));

      if (isNextLevelH2) break;
      sibling.style.display = display;
      sibling = sibling.nextElementSibling;
    }
  });
}

export default function PersonalizationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [skillLevel, setSkillLevel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Apply filter and also watch for route changes (SPA navigation)
  const applyFilter = useCallback(
    (level) => {
      // Small delay to let Docusaurus render the new page content
      setTimeout(() => applyContentFilter(level || skillLevel), 150);
    },
    [skillLevel]
  );

  useEffect(() => {
    setIsClient(true);
    loadUserLevel();
  }, []);

  // Re-apply filter on every pathname change (SPA navigation)
  useEffect(() => {
    if (!isClient || isLoading) return;

    const handleRouteChange = () => applyFilter(skillLevel);

    // Listen for popstate (back/forward)
    window.addEventListener('popstate', handleRouteChange);

    // Also apply immediately when skillLevel is known
    applyFilter(skillLevel);

    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [skillLevel, isClient, isLoading, applyFilter]);

  const loadUserLevel = async () => {
    setIsLoading(true);

    // 1. Check URL parameter first (?level=beginner|intermediate|advanced)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLevel = urlParams.get('level');
    if (urlLevel && SKILL_LEVELS.includes(urlLevel)) {
      localStorage.setItem('userSkillLevel', urlLevel);
      setSkillLevel(urlLevel);
      setIsLoading(false);
      return;
    }

    // 2. Check localStorage
    const stored = localStorage.getItem('userSkillLevel');
    if (stored && SKILL_LEVELS.includes(stored)) {
      setSkillLevel(stored);
      setIsLoading(false);
      return;
    }

    // 3. Try backend API
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const profile = await response.json();
        if (profile.skill_level && SKILL_LEVELS.includes(profile.skill_level)) {
          localStorage.setItem('userSkillLevel', profile.skill_level);
          setSkillLevel(profile.skill_level);
        }
      }
    } catch {
      // Backend not reachable — user can select manually
    }

    setIsLoading(false);
  };

  const handleLevelSelect = (level) => {
    localStorage.setItem('userSkillLevel', level);
    setSkillLevel(level);
    setIsOpen(false);
    // Reload to apply filter cleanly (Docusaurus SPA)
    window.location.reload();
  };

  if (!isClient) return null;

  const config = skillLevel ? skillConfig[skillLevel] : null;

  return (
    <>
      {/* ── Floating Button ── */}
      <div
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          zIndex: 99990,
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Personalize Content"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
            color: 'white',
            border: '2px solid white',
            boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.4)';
          }}
        >
          {isLoading ? '…' : config ? config.emoji : '✨'}
        </button>

        {/* Current level badge */}
        {config && !isOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '-22px',
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              fontSize: '10px',
              fontWeight: '700',
              color: '#7c3aed',
              background: '#f5f3ff',
              border: '1px solid #ddd6fe',
              borderRadius: '999px',
              padding: '2px 8px',
            }}
          >
            {config.label}
          </div>
        )}
      </div>

      {/* ── Popup Panel ── */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.25)',
              zIndex: 99989,
            }}
          />

          {/* Panel */}
          <div
            style={{
              position: 'fixed',
              bottom: '175px',
              right: '24px',
              width: '300px',
              backgroundColor: 'white',
              borderRadius: '20px',
              boxShadow: '0 16px 48px rgba(124,58,237,0.2)',
              zIndex: 99991,
              overflow: 'hidden',
              border: '1px solid #ede9fe',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 20px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                color: 'white',
              }}
            >
              <p style={{ margin: 0, fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Content Level
              </p>
              <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '700' }}>
                {skillLevel ? `Viewing: ${config.label}` : 'Select Your Level'}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.85 }}>
                Only your selected level will be shown
              </p>
            </div>

            {/* Level Options */}
            <div style={{ padding: '12px' }}>
              {SKILL_LEVELS.map((level) => {
                const lc = skillConfig[level];
                const isActive = level === skillLevel;

                return (
                  <button
                    key={level}
                    onClick={() => handleLevelSelect(level)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      marginBottom: '8px',
                      backgroundColor: isActive ? '#f5f3ff' : '#fafafa',
                      border: isActive ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = '#c4b5fd';
                        e.currentTarget.style.backgroundColor = '#faf5ff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.backgroundColor = '#fafafa';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '22px' }}>{lc.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p style={{
                            margin: 0,
                            fontWeight: '700',
                            color: isActive ? '#7c3aed' : '#374151',
                            fontSize: '14px',
                          }}>
                            {lc.label}
                          </p>
                          {isActive && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: '700',
                              color: '#7c3aed',
                              background: '#ede9fe',
                              padding: '2px 8px',
                              borderRadius: '999px',
                            }}>
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p style={{
                          margin: '2px 0 0',
                          fontSize: '11px',
                          color: '#6b7280',
                        }}>
                          {lc.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Show all footer */}
            {skillLevel && (
              <div style={{
                padding: '10px 12px 14px',
                borderTop: '1px solid #f3f4f6',
                textAlign: 'center',
              }}>
                <button
                  onClick={() => {
                    localStorage.removeItem('userSkillLevel');
                    setSkillLevel(null);
                    window.location.reload();
                  }}
                  style={{
                    padding: '7px 16px',
                    backgroundColor: 'transparent',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  Show All Levels
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
