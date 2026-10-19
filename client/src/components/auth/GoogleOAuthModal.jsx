import React, { useState } from 'react';
import { ShieldAlert, ExternalLink, Check, Copy, X, KeyRound, Sparkles } from 'lucide-react';

export const GoogleOAuthModal = ({ isOpen, onClose, onOpenDevModal }) => {
  const [copiedStep, setCopiedStep] = useState(null);

  if (!isOpen) return null;

  const copyToClipboard = (text, step) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card oauth-setup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: 'rgba(66, 133, 244, 0.15)', color: '#4285F4' }}>
              <KeyRound size={20} />
            </div>
            <div>
              <h3>Google OAuth 2.0 Setup</h3>
              <p className="modal-subtitle">How to enable actual Google Sign-In</p>
            </div>
          </div>
          <button className="icon-btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="oauth-setup-notice">
          <p>
            Actual Google Sign-In requires a <strong>Google Client ID</strong> from Google Cloud Console so Google knows which domain (<code>http://localhost:5173</code>) is allowed to authenticate.
          </p>
        </div>

        <div className="setup-steps-list">
          <div className="setup-step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <strong>Open Google Cloud Console</strong>
              <p>Go to the Google Cloud Credentials page to create your OAuth 2.0 Client.</p>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="step-link-btn"
              >
                <span>Google Cloud Credentials</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          <div className="setup-step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <strong>Create OAuth 2.0 Client ID</strong>
              <p>Click <em>Create Credentials → OAuth client ID → Web application</em>.</p>
              <div className="code-snippet-box">
                <div className="snippet-header">
                  <span>Authorized JavaScript origins</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard('http://localhost:5173', 2)}
                  >
                    {copiedStep === 2 ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedStep === 2 ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <code>http://localhost:5173</code>
              </div>
            </div>
          </div>

          <div className="setup-step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <strong>Paste Client ID in your .env files</strong>
              <p>Add your generated Client ID into both project <code>.env</code> files:</p>
              <div className="env-paths-box">
                <div><code>client/.env</code> → <code>VITE_GOOGLE_CLIENT_ID=&lt;your-id&gt;</code></div>
                <div><code>server/.env</code> → <code>GOOGLE_CLIENT_ID=&lt;your-id&gt;</code></div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              onClose();
              if (onOpenDevModal) onOpenDevModal();
            }}
          >
            <Sparkles size={15} />
            <span>Use Dev Sandbox for Now</span>
          </button>
          <button type="button" className="btn-primary" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthModal;
