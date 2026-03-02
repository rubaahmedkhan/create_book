import React, { useEffect, useState } from 'react';

/**
 * AuthGate Component
 *
 * Checks if user is authenticated before showing content.
 * If not authenticated, shows a login prompt with redirect to signup.
 *
 * SECURITY: Always verifies session with backend first.
 * URL level parameter only works if user is already authenticated.
 */

const FRONTEND_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:8000';

export default function AuthGate({ children }) {
  const [authState, setAuthState] = useState('checking'); // 'checking' | 'authenticated' | 'unauthenticated' | 'no-profile'
  const [userLevel, setUserLevel] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // SECURITY: Always verify with backend first - don't trust localStorage or URL params alone
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // User is authenticated AND has a profile
        const profile = await response.json();

        // Store skill level for personalization
        localStorage.setItem('userSkillLevel', profile.skill_level);
        localStorage.setItem('userBackground', profile.background_category);
        localStorage.setItem('userProfile', JSON.stringify(profile));

        setUserLevel(profile.skill_level);
        setAuthState('authenticated');
        return;
      }

      if (response.status === 404) {
        // User is authenticated but no profile - redirect to questionnaire
        console.log('[AuthGate] Authenticated but no profile, redirecting to questionnaire...');
        setAuthState('no-profile');
        setTimeout(() => {
          window.location.href = `${FRONTEND_URL}/questionnaire`;
        }, 2000);
        return;
      }

      if (response.status === 401) {
        // Not authenticated - clear any stale localStorage and show login
        localStorage.removeItem('userSkillLevel');
        localStorage.removeItem('userBackground');
        localStorage.removeItem('userProfile');
        setAuthState('unauthenticated');
        return;
      }

      // Any other error - treat as unauthenticated
      setAuthState('unauthenticated');
    } catch (error) {
      console.error('Auth check failed:', error);
      // Network error - treat as unauthenticated for security
      setAuthState('unauthenticated');
    }
  };

  if (authState === 'checking') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ marginTop: '16px', color: '#64748b' }}>Checking authentication...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (authState === 'no-profile') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '20px',
      }}>
        <div style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          padding: '40px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '12px',
          }}>
            Complete Your Profile
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            marginBottom: '24px',
            lineHeight: '1.6',
          }}>
            Please complete the questionnaire to personalize your learning experience.
          </p>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
            Redirecting to questionnaire...
          </p>
          <button
            onClick={() => {
              window.location.href = `${FRONTEND_URL}/questionnaire`;
            }}
            style={{
              width: '100%',
              padding: '14px 24px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            Go to Questionnaire
          </button>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '20px',
      }}>
        <div style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          padding: '40px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔐</div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '12px',
          }}>
            Sign Up Required
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            marginBottom: '24px',
            lineHeight: '1.6',
          }}>
            To access personalized learning content, please sign up and complete a short questionnaire about your background.
          </p>

          <div style={{
            backgroundColor: '#f0f9ff',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
          }}>
            <h3 style={{ color: '#0369a1', marginBottom: '12px', fontSize: '16px' }}>
              What you'll get:
            </h3>
            <ul style={{
              textAlign: 'left',
              color: '#475569',
              fontSize: '14px',
              margin: 0,
              paddingLeft: '20px',
            }}>
              <li style={{ marginBottom: '8px' }}>Content personalized to your skill level</li>
              <li style={{ marginBottom: '8px' }}>Customized learning path</li>
              <li style={{ marginBottom: '8px' }}>Progress tracking</li>
              <li>AI-powered assistance</li>
            </ul>
          </div>

          <button
            onClick={() => {
              window.location.href = `${FRONTEND_URL}/signup`;
            }}
            style={{
              width: '100%',
              padding: '14px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Sign Up Now
          </button>

          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Already have an account?{' '}
            <a
              href={`${FRONTEND_URL}/signin`}
              style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Authenticated - show content
  return <>{children}</>;
}
