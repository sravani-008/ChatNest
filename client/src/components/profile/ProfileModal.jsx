import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { userService } from '../../services/userService.js';
import Avatar from '../common/Avatar.jsx';
import { X, Check, Edit3, User, Mail, Shield, Calendar, AlertCircle } from 'lucide-react';
import { Spinner } from '../common/StatusIndicator.jsx';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
    }
    setError(null);
    setSuccessMsg('');
    setIsEditing(false);
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMsg('');

    try {
      const updated = await userService.updateMyProfile({
        name: name.trim(),
        bio: bio.trim() || null,
      });
      updateUser(updated);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <User size={18} />
            </div>
            <h3>User Profile</h3>
          </div>
          <button className="icon-btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="profile-banner">
          <Avatar
            src={user.avatarUrl}
            name={user.name}
            status={user.status}
            size="xl"
            className="profile-modal-avatar"
          />
          <div className="profile-banner-status">
            <span className={`status-pill ${user.status === 'online' ? 'online' : 'offline'}`}>
              {user.status === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {error && (
          <div className="alert-error-box">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-success-box">
            <Check size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSave} className="profile-edit-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                placeholder="Your display name"
              />
            </div>

            <div className="form-group">
              <label>Bio / About</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Write a few words about yourself..."
              />
            </div>

            <div className="profile-edit-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setName(user.name || '');
                  setBio(user.bio || '');
                  setIsEditing(false);
                }}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSaving || !name.trim()}>
                {isSaving ? <Spinner size="sm" /> : <Check size={16} />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details-view">
            <div className="profile-field-card">
              <div className="field-label">Name</div>
              <div className="field-value-row">
                <span className="field-text font-bold">{user.name}</span>
                <button
                  className="icon-btn-sm"
                  onClick={() => setIsEditing(true)}
                  title="Edit Name"
                >
                  <Edit3 size={15} />
                </button>
              </div>
            </div>

            <div className="profile-field-card">
              <div className="field-label">About / Bio</div>
              <div className="field-value-row">
                <span className="field-text text-muted">
                  {user.bio || 'Hey there! I am using ChatNest.'}
                </span>
                <button
                  className="icon-btn-sm"
                  onClick={() => setIsEditing(true)}
                  title="Edit Bio"
                >
                  <Edit3 size={15} />
                </button>
              </div>
            </div>

            <div className="profile-field-card">
              <div className="field-label">Email</div>
              <div className="field-value-row">
                <div className="field-icon-text">
                  <Mail size={15} className="field-icon" />
                  <span className="field-text">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="profile-field-card">
              <div className="field-label">Account Verification</div>
              <div className="field-value-row">
                <div className="field-icon-text">
                  <Shield size={15} className="field-icon" />
                  <span className="field-text">Google Account Connected</span>
                </div>
              </div>
            </div>

            <div className="profile-field-card">
              <div className="field-label">Member Since</div>
              <div className="field-value-row">
                <div className="field-icon-text">
                  <Calendar size={15} className="field-icon" />
                  <span className="field-text">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' }) : 'Recently'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
