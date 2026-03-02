import React, { useState, useEffect, createContext, useContext } from 'react';
import styles from './AuthGuard.module.css';

// Context to share user profile data across the app
export const UserContext = createContext(null);

// Hook to access user data
export function useUser() {
  return useContext(UserContext);
}

const FRONTEND_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:8000';

/**
 * AuthGuard Component
 *
 * Protects Docusaurus content from unauthenticated access.
 * - Checks if user has valid session
 * - Redirects to signin if not authenticated
 * - Redirects to questionnaire if no profile exists
 * - Provides user profile context to children
 */
export default function AuthGuard({ children }) {
  const [authState, setAuthState] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated' | 'no-profile'
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Get skill level from URL if provided (when coming from dashboard)
      const urlParams = new URLSearchParams(window.location.search);
      const levelFromUrl = urlParams.get('level');

      // Check if user has valid session by calling backend profile endpoint
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        method: 'GET',
        credentials: 'include', // Important: send cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);

        // Store skill level in localStorage for personalization
        localStorage.setItem('userSkillLevel', profile.skill_level);
        localStorage.setItem('userBackground', profile.background_category);
        localStorage.setItem('userProfile', JSON.stringify(profile));

        setAuthState('authenticated');
      } else if (response.status === 404) {
        // User authenticated but no profile - redirect to questionnaire
        console.log('[AuthGuard] No profile found, redirecting to questionnaire...');
        setAuthState('no-profile');
        setTimeout(() => {
          window.location.href = `${FRONTEND_URL}/questionnaire`;
        }, 2000);
      } else if (response.status === 401) {
        // Not authenticated - redirect to signin
        console.log('[AuthGuard] Not authenticated, redirecting to signin...');
        setAuthState('unauthenticated');
        setTimeout(() => {
          // Save current URL to redirect back after signin
          const returnUrl = encodeURIComponent(window.location.href);
          window.location.href = `${FRONTEND_URL}/signin?returnUrl=${returnUrl}`;
        }, 2000);
      } else {
        throw new Error('Authentication check failed');
      }
    } catch (err) {
      console.error('[AuthGuard] Error checking authentication:', err);
      setError(err.message);
      setAuthState('unauthenticated');

      // Redirect to signin on error
      setTimeout(() => {
        window.location.href = `${FRONTEND_URL}/signin`;
      }, 3000);
    }
  };

  // Loading state
  if (authState === 'loading') {
    return (
      <div className={styles.authOverlay}>
        <div className={styles.authCard}>
          <div className={styles.spinner}></div>
          <h2>Checking Authentication...</h2>
          <p>Please wait while we verify your access.</p>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (authState === 'unauthenticated') {
    return (
      <div className={styles.authOverlay}>
        <div className={styles.authCard}>
          <div className={styles.icon}>🔒</div>
          <h2>Authentication Required</h2>
          <p>You need to sign in to access this content.</p>
          <p className={styles.redirectText}>Redirecting to sign in page...</p>
          <a href={`${FRONTEND_URL}/signin`} className={styles.button}>
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  // No profile state
  if (authState === 'no-profile') {
    return (
      <div className={styles.authOverlay}>
        <div className={styles.authCard}>
          <div className={styles.icon}>📋</div>
          <h2>Complete Your Profile</h2>
          <p>Please complete the questionnaire to personalize your learning experience.</p>
          <p className={styles.redirectText}>Redirecting to questionnaire...</p>
          <a href={`${FRONTEND_URL}/questionnaire`} className={styles.button}>
            Go to Questionnaire
          </a>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.authOverlay}>
        <div className={styles.authCard}>
          <div className={styles.icon}>⚠️</div>
          <h2>Error</h2>
          <p>{error}</p>
          <a href={`${FRONTEND_URL}/signin`} className={styles.button}>
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  // Authenticated - render content with user context
  return (
    <UserContext.Provider value={userProfile}>
      {children}
    </UserContext.Provider>
  );
}
