import React from 'react';
import Avatar from '../common/Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { LogOut, User, MessageSquare } from 'lucide-react';

export const Navbar = ({ onOpenProfile, onOpenDiscovery }) => {
  const { user, logout } = useAuth();

  return (
    <header className="app-navbar">
      <div className="navbar-brand">
        <div className="navbar-logo-icon">
          <MessageSquare size={20} />
        </div>
        <span className="navbar-brand-name">ChatNest</span>
      </div>

      <div className="navbar-actions">
        {user && (
          <>
            <button
              className="navbar-user-btn"
              onClick={onOpenProfile}
              title="View & Edit Profile"
            >
              <Avatar
                src={user.avatarUrl}
                name={user.name}
                status={user.status}
                size="sm"
              />
              <span className="navbar-user-name">{user.name}</span>
            </button>

            <button
              className="icon-btn-ghost"
              onClick={logout}
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
