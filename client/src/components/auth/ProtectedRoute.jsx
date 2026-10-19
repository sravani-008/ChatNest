import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Spinner } from '../common/StatusIndicator.jsx';

export const ProtectedRoute = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="full-page-loading">
        <div className="loading-card">
          <div className="brand-logo-animated">
            <span className="logo-sparkle">✦</span>
            <h2>ChatNest</h2>
          </div>
          <Spinner size="lg" />
          <p>Connecting securely...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  return children;
};

export default ProtectedRoute;
