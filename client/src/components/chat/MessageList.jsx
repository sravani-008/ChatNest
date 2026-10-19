import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem.jsx';
import { formatMessageDateHeader } from '../../utils/formatDate.js';
import { Spinner } from '../common/StatusIndicator.jsx';
import { Lock } from 'lucide-react';

export const MessageList = ({ messages, currentUserId, isLoading }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="messages-loading">
        <Spinner size="md" />
        <span>Loading messages...</span>
      </div>
    );
  }

  // Group messages by calendar date
  let lastDateHeader = null;

  return (
    <div className="messages-viewport" ref={containerRef}>
      {/* End-to-end security disclaimer banner matching modern chat */}
      <div className="security-notice-pill">
        <Lock size={12} />
        <span>Messages are authenticated and delivered in real-time</span>
      </div>

      {messages.map((message) => {
        const dateHeader = formatMessageDateHeader(message.createdAt);
        const showHeader = dateHeader !== lastDateHeader;
        if (showHeader) {
          lastDateHeader = dateHeader;
        }

        const isMe = message.senderId === currentUserId;

        return (
          <React.Fragment key={message.id}>
            {showHeader && (
              <div className="date-separator">
                <span className="date-separator-pill">{dateHeader}</span>
              </div>
            )}
            <MessageItem message={message} isMe={isMe} />
          </React.Fragment>
        );
      })}

      <div ref={messagesEndRef} className="messages-anchor" />
    </div>
  );
};

export default MessageList;
