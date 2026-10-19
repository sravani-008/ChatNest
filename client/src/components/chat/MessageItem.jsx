import React from 'react';
import { formatMessageTime } from '../../utils/formatDate.js';
import { Check, CheckCheck } from 'lucide-react';

export const MessageItem = ({ message, isMe }) => {
  const { text, createdAt, readAt } = message;

  return (
    <div className={`message-row ${isMe ? 'message-outgoing' : 'message-incoming'}`}>
      <div className={`message-bubble ${isMe ? 'bubble-outgoing' : 'bubble-incoming'}`}>
        <div className="message-text">{text}</div>
        <div className="message-meta">
          <span className="message-time">{formatMessageTime(createdAt)}</span>
          {isMe && (
            <span
              className={`message-status-ticks ${readAt ? 'read' : 'sent'}`}
              title={readAt ? `Read at ${formatMessageTime(readAt)}` : 'Sent'}
            >
              {readAt ? <CheckCheck size={15} /> : <Check size={14} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
