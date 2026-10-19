import React from 'react';

export const StatusIndicator = ({ status = 'offline', text = null }) => {
  return (
    <div className="status-indicator-wrapper">
      <span className={`status-bubble ${status === 'online' ? 'online' : 'offline'}`} />
      {text && <span className="status-text">{text}</span>}
    </div>
  );
};

export const Spinner = ({ size = 'md', className = '' }) => {
  return <div className={`loader-spinner spinner-${size} ${className}`} />;
};

export default StatusIndicator;
