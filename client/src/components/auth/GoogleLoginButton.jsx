import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export const GoogleLoginButton = ({ onMissingClientId }) => {
  const { loginWithGoogle, isLoading } = useAuth();
  const googleBtnRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const initializeGoogleSignIn = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              if (response.credential) {
                try {
                  await loginWithGoogle(response.credential);
                } catch (err) {
                  console.error('Google login verification failed:', err);
                }
              }
            },
          });

          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'pill',
          });
        } catch (e) {
          console.warn('Google Identity Services render error:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
    } else {
      const timer = setTimeout(initializeGoogleSignIn, 500);
      return () => clearTimeout(timer);
    }
  }, [clientId, loginWithGoogle]);

  const handleOAuth2Popup = () => {
    if (!clientId) {
      if (onMissingClientId) onMissingClientId();
      return;
    }

    if (window.google?.accounts?.oauth2) {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.access_token) {
            try {
              await loginWithGoogle({ accessToken: tokenResponse.access_token });
            } catch (err) {
              console.error('OAuth2 token login failed:', err);
            }
          }
        },
      });
      tokenClient.requestAccessToken();
    } else if (onMissingClientId) {
      onMissingClientId();
    }
  };

  return (
    <div className="google-btn-wrapper">
      {clientId ? (
        <div className="google-btn-custom-group">
          <div ref={googleBtnRef} className="google-btn-container" />
          <button
            type="button"
            className="btn-google-popup"
            onClick={handleOAuth2Popup}
            disabled={isLoading}
            title="Launch Google OAuth2 popup"
          >
            Launch Google OAuth2 Popup
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn-google"
          onClick={handleOAuth2Popup}
          disabled={isLoading}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google (OAuth 2.0)</span>
        </button>
      )}
    </div>
  );
};

export default GoogleLoginButton;
