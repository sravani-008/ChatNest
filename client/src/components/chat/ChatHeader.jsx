import React from 'react';
import Avatar from '../common/Avatar.jsx';
import { formatLastSeen } from '../../utils/formatDate.js';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';

export const ChatHeader = ({ participant, onBack, onOpenInfo }) => {
  if (!participant) return null;

  return (
    <div className="chat-header">
      <div className="chat-header-left">
        {onBack && (
          <button className="chat-back-btn" onClick={onBack} title="Back to chats">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="chat-header-avatar" onClick={onOpenInfo} role="button" tabIndex={0}>
          <Avatar
            src={participant.avatarUrl}
            name={participant.name}
            status={participant.status}
            size="md"
          />
        </div>
        <div className="chat-header-info" onClick={onOpenInfo} role="button" tabIndex={0}>
          <h3 className="chat-header-name">{participant.name}</h3>
          <span
            className={`chat-header-status ${
              participant.status === 'online' ? 'status-online' : 'status-offline'
            }`}
          >
            {formatLastSeen(participant.status, participant.lastSeen)}
          </span>
        </div>
      </div>

      <div className="chat-header-actions">
        <button className="header-action-btn" title="Voice call (Coming in V2)" disabled>
          <Phone size={18} />
        </button>
        <button className="header-action-btn" title="Video call (Coming in V2)" disabled>
          <Video size={18} />
        </button>
        <button className="header-action-btn" onClick={onOpenInfo} title="View Details">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
