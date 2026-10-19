import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import GoogleLoginButton from '../components/auth/GoogleLoginButton.jsx';
import DevLoginModal from '../components/auth/DevLoginModal.jsx';
import GoogleOAuthModal from '../components/auth/GoogleOAuthModal.jsx';
import { MessageSquare, ShieldCheck, Zap, Users, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';

export const LoginPage = () => {
  const { authError } = useAuth();
  const [showDevModal, setShowDevModal] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const hasClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return (
    <div className="login-page-container">
      {/* Dynamic ambient background glow */}
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />

      <div className="login-card-container">
        {/* Left hero side */}
        <div className="login-hero-pane">
          <div className="login-brand-header">
            <div className="brand-logo-mark">
              <MessageSquare size={28} />
            </div>
            <h1 className="brand-title">ChatNest</h1>
          </div>

          <h2 className="hero-headline">
            Real-time conversations, seamless presence.
          </h2>
          <p className="hero-subtext">
            Experience lightning fast messaging powered by WebSockets, Google Authentication, and modern design.
          </p>

          <div className="hero-feature-list">
            <div className="hero-feature-item">
              <div className="feature-icon-wrapper">
                <Zap size={18} />
              </div>
              <div className="feature-item-text">
                <strong>Instant Socket Sync</strong>
                <span>Real-time delivery, typing, and read receipts</span>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={18} />
              </div>
              <div className="feature-item-text">
                <strong>Google Authentication</strong>
                <span>Official Google OAuth 2.0 verification without passwords</span>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="feature-icon-wrapper">
                <Users size={18} />
              </div>
              <div className="feature-item-text">
                <strong>Presence & Discovery</strong>
                <span>Live online/offline status and user search</span>
              </div>
            </div>
          </div>

          <div className="login-footer-pill">
            <CheckCircle2 size={15} />
            <span>Built strictly to ChatNest V1 API & Socket specifications</span>
          </div>
        </div>

        {/* Right action side */}
        <div className="login-action-pane">
          <div className="login-form-box">
            <div className="form-header-badge">
              <span>Welcome to ChatNest</span>
            </div>
            <h3 className="form-title">Sign In with Google</h3>
            <p className="form-desc">
              Connect securely using your Google OAuth 2.0 account.
            </p>

            {authError && (
              <div className="alert-error-box">
                <span>{authError}</span>
              </div>
            )}

            <div className="google-auth-container">
              <GoogleLoginButton onMissingClientId={() => setShowOAuthModal(true)} />
            </div>

            {!hasClientId && (
              <button
                type="button"
                className="oauth-help-link"
                onClick={() => setShowOAuthModal(true)}
              >
                <HelpCircle size={14} />
                <span>How to configure your Google Client ID</span>
              </button>
            )}

            <div className="login-or-divider">
              <span>or development sandbox</span>
            </div>

            <button
              type="button"
              className="btn-dev-sandbox"
              onClick={() => setShowDevModal(true)}
            >
              <Sparkles size={16} />
              <span>Select Test Google Profile / Dev Mode</span>
            </button>

            <div className="login-disclaimer">
              <p>
                By signing in, you agree to ChatNest's Terms of Service and Privacy Policy. Password-based authentication is disabled by contract.
              </p>
            </div>
          </div>
        </div>
      </div>

      <GoogleOAuthModal
        isOpen={showOAuthModal}
        onClose={() => setShowOAuthModal(false)}
        onOpenDevModal={() => setShowDevModal(true)}
      />

      <DevLoginModal
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
      />
    </div>
  );
};

export default LoginPage;
