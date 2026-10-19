import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService.js';
import Avatar from '../common/Avatar.jsx';
import { formatLastSeen } from '../../utils/formatDate.js';
import { Search, UserPlus, X, MessageSquare, AlertCircle } from 'lucide-react';
import { Spinner } from '../common/StatusIndicator.jsx';

export const UserDiscoveryModal = ({ isOpen, onClose, onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const list = await userService.getUsers(search);
        if (isMounted) {
          setUsers(list);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to search users.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(fetchUsers, search ? 300 : 0);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [isOpen, search]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card discovery-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <UserPlus size={18} />
            </div>
            <div>
              <h3>New Conversation</h3>
              <p className="modal-subtitle">Find people on ChatNest to start chatting</p>
            </div>
          </div>
          <button className="icon-btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="discovery-search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="discovery-content">
          {isLoading && (
            <div className="discovery-loading">
              <Spinner size="md" />
              <span>Searching users...</span>
            </div>
          )}

          {error && (
            <div className="discovery-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && users.length === 0 && (
            <div className="discovery-empty">
              <p>No other users found.</p>
              <small>Open ChatNest in an incognito window or second browser to sign in as another user!</small>
            </div>
          )}

          {!isLoading && !error && users.length > 0 && (
            <div className="discovery-user-list">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="discovery-user-item"
                  onClick={() => {
                    onSelectUser(u.id);
                    onClose();
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <Avatar
                    src={u.avatarUrl}
                    name={u.name}
                    status={u.status}
                    size="md"
                  />
                  <div className="discovery-user-details">
                    <span className="discovery-user-name">{u.name}</span>
                    <span className="discovery-user-email">{u.email}</span>
                    <span className="discovery-user-status">
                      {formatLastSeen(u.status, u.lastSeen)}
                    </span>
                  </div>
                  <button className="btn-chat-action">
                    <MessageSquare size={16} />
                    <span>Chat</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDiscoveryModal;
