import React from 'react';
import Avatar from '../common/Avatar.jsx';
import { formatConversationTime } from '../../utils/formatDate.js';
import { Check, CheckCheck } from 'lucide-react';

export const ConversationItem = ({ conversation, isActive, onSelect, currentUserId }) => {
  const { participant, lastMessage, unreadCount, updatedAt } = conversation;

  if (!participant) return null;

  const isMyLastMessage = lastMessage && lastMessage.senderId === currentUserId;

  return (
    <div
      className={`conversation-item ${isActive ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
      onClick={() => onSelect(conversation.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(conversation.id)}
    >
      <div className="conv-avatar-col">
        <Avatar
          src={participant.avatarUrl}
          name={participant.name}
          status={participant.status}
          size="md"
        />
      </div>

      <div className="conv-content-col">
        <div className="conv-top-row">
          <span className="conv-name">{participant.name}</span>
          <span className="conv-time">
            {formatConversationTime(lastMessage?.createdAt || updatedAt)}
          </span>
        </div>

        <div className="conv-bottom-row">
          <div className="conv-preview-wrapper">
            {isMyLastMessage && (
              <span className="conv-check-icon">
                <Check size={14} />
              </span>
            )}
            <span className="conv-preview-text">
              {lastMessage ? lastMessage.text : 'Conversation started'}
            </span>
          </div>

          {unreadCount > 0 && (
            <span className="conv-unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
