import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from '../common/Avatar.jsx';
import { User, Sparkles, ArrowRight, X } from 'lucide-react';

const PRESET_USERS = [
  {
    name: 'Sarah Connor',
    email: 'sarah.connor@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Frontend Engineer',
  },
  {
    name: 'Marcus Reed',
    email: 'marcus.reed@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Full-Stack Developer',
  },
  {
    name: 'Elena Rostova',
    email: 'elena.rostova@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Product Designer',
  },
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'DevOps Lead',
  },
];

export const DevLoginModal = ({ isOpen, onClose }) => {
  const { loginWithDev, isLoading, authError } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  if (!isOpen) return null;

  const handleSelectUser = async (u) => {
    try {
      await loginWithDev(u);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail) return;
    try {
      await loginWithDev({
        email: customEmail,
        name: customName || customEmail.split('@')[0],
      });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card dev-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="badge-tag">
              <Sparkles size={14} /> Dev Sandbox
            </div>
            <h3>Quick Sign In</h3>
          </div>
          <button className="icon-btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="modal-subtitle">
          Select a test Google profile or enter your own to test real-time chat across tabs without configuring OAuth keys.
        </p>

        {authError && <div className="alert-error-box">{authError}</div>}

        <div className="preset-user-list">
          {PRESET_USERS.map((u) => (
            <button
              key={u.email}
              className="preset-user-card"
              onClick={() => handleSelectUser(u)}
              disabled={isLoading}
            >
              <Avatar src={u.avatarUrl} name={u.name} size="md" />
              <div className="preset-user-info">
                <span className="preset-name">{u.name}</span>
                <span className="preset-email">{u.email}</span>
                <span className="preset-role">{u.role}</span>
              </div>
              <ArrowRight size={16} className="preset-arrow" />
            </button>
          ))}
        </div>

        <div className="modal-divider">
          <span>or sign in with custom details</span>
        </div>

        <form onSubmit={handleCustomSubmit} className="custom-login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="e.g. user@gmail.com"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Display Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Alex River"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isLoading || !customEmail}>
            {isLoading ? 'Signing in...' : 'Sign In as Custom User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DevLoginModal;
