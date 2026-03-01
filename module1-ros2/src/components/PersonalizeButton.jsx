import React, { useState, useEffect } from 'react';

/**
 * PersonalizeButton Component
 *
 * A floating button for content personalization.
 * - Always visible (bottom-right corner)
 * - Tries to load skill level from backend or localStorage
 * - Allows manual level selection
 * - Reloads page to apply personalization
 */

const BACKEND_URL = 'http://localhost:8001';
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'];

const skillConfig = {
  beginner: {
    color: '#22c55e',
    bgColor: '#f0fdf4',
    emoji: '🌱',
    label: 'Beginner',
    description: 'Foundation concepts with detailed explanations'
  },
  intermediate: {
    color: '#3b82f6',
    bgColor: '#eff6ff',
    emoji: '🚀',
    label: 'Intermediate',
    description: 'Practical skills with real-world examples'
  },
  advanced: {
    color: '#a855f7',
    bgColor: '#faf5ff',
    emoji: '⚡',
    label: 'Advanced',
    description: 'Advanced techniques and optimizations'
  }
};

export default function PersonalizeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [skillLevel, setSkillLevel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);

    // First check localStorage
    const storedLevel = localStorage.getItem('userSkillLevel');
    if (storedLevel && SKILL_LEVELS.includes(storedLevel)) {
      setSkillLevel(storedLevel);
      setIsLoading(false);
      return;
    }

    // Try to fetch from backend
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
          localStorage.setItem('userBackground', profile.background_category || '');
          setSkillLevel(profile.skill_level);
        }
      }
    } catch (error) {
      console.log('Could not fetch profile, using manual selection');
    }

    setIsLoading(false);
  };

  const handleLevelSelect = (level) => {
    localStorage.setItem('userSkillLevel', level);
    setSkillLevel(level);
    setIsOpen(false);
    // Reload to apply personalization
    window.location.reload();
  };

  // Don't render on server
  if (!isClient) return null;

  const config = skillLevel ? skillConfig[skillLevel] : null;

  return (
    <>
      {/* Floating Button - ALWAYS shows */}
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
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: config ? config.color : '#6366f1',
            color: 'white',
            border: '2px solid white',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          title="Personalize Content"
        >
          {isLoading ? '...' : (config ? config.emoji : '✨')}
        </button>
      </div>

      {/* Popup Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
              zIndex: 99989,
            }}
          />

          {/* Panel */}
          <div
            style={{
              position: 'fixed',
              bottom: '170px',
              right: '24px',
              width: '320px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              zIndex: 99991,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                {skillLevel ? '✨ Your Level' : '✨ Select Your Level'}
              </h3>
              <p style={{ margin: '8px 0 0', fontSize: '14px', opacity: 0.9 }}>
                {skillLevel
                  ? `Content personalized for ${config.label.toLowerCase()} level`
                  : 'Choose to personalize your content'
                }
              </p>
            </div>

            {/* Level Options */}
            <div style={{ padding: '16px' }}>
              {SKILL_LEVELS.map((level) => {
                const levelConfig = skillConfig[level];
                const isActive = level === skillLevel;

                return (
                  <button
                    key={level}
                    onClick={() => handleLevelSelect(level)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      marginBottom: '8px',
                      backgroundColor: isActive ? levelConfig.bgColor : '#f8fafc',
                      border: isActive ? `2px solid ${levelConfig.color}` : '2px solid transparent',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{levelConfig.emoji}</span>
                      <div>
                        <p style={{
                          margin: 0,
                          fontWeight: '600',
                          color: levelConfig.color,
                          fontSize: '15px',
                        }}>
                          {levelConfig.label}
                          {isActive && ' ✓'}
                        </p>
                        <p style={{
                          margin: '2px 0 0',
                          fontSize: '12px',
                          color: '#64748b',
                        }}>
                          {levelConfig.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            {skillLevel && (
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #e2e8f0',
                textAlign: 'center',
              }}>
                <button
                  onClick={() => {
                    localStorage.removeItem('userSkillLevel');
                    setSkillLevel(null);
                    window.location.reload();
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Show All Content
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
