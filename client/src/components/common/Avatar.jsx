import React from 'react';

const COLORS = [
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  'linear-gradient(135deg, #ec4899, #be185d)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #06b6d4, #0891b2)',
];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getColor = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

export const Avatar = ({
  src,
  name = '',
  status = null,
  size = 'md', // sm (32px), md (44px), lg (64px), xl (96px)
  className = '',
}) => {
  const [imageFailed, setImageFailed] = React.useState(false);
  const initials = getInitials(name);
  const background = getColor(name);

  const sizeClasses = {
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl',
  }[size] || 'avatar-md';

  return (
    <div className={`avatar-container ${sizeClasses} ${className}`}>
      {src && !imageFailed ? (
        <img
          src={src}
          alt={name}
          className="avatar-img"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="avatar-fallback" style={{ background }}>
          <span>{initials}</span>
        </div>
      )}

      {status && (
        <span
          className={`avatar-status-dot ${status === 'online' ? 'status-online' : 'status-offline'}`}
          title={status === 'online' ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};

export default Avatar;
