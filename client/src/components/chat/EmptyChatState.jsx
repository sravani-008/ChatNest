import React from 'react';
import { MessageSquare, ShieldCheck, Zap, UserPlus } from 'lucide-react';

export const EmptyChatState = ({ onOpenDiscovery }) => {
  return (
    <div className="empty-chat-viewport">
      <div className="empty-chat-content">
        <div className="empty-chat-illustration">
          <div className="icon-glow-ring">
            <MessageSquare size={44} className="main-empty-icon" />
          </div>
        </div>

        <h2 className="empty-chat-title">ChatNest for Web</h2>
        <p className="empty-chat-desc">
          Send and receive messages in real time. Choose a conversation from the sidebar or start a new direct message.
        </p>

        <div className="empty-chat-features">
          <div className="feature-pill">
            <Zap size={14} className="pill-icon" />
            <span>Instant Socket.IO sync</span>
          </div>
          <div className="feature-pill">
            <ShieldCheck size={14} className="pill-icon" />
            <span>Google verified authentication</span>
          </div>
        </div>

        <button className="btn-primary start-chat-cta" onClick={onOpenDiscovery}>
          <UserPlus size={18} />
          <span>Start New Conversation</span>
        </button>
      </div>

      <div className="empty-chat-footer">
        <span>🔒 Secure, Real-time Communication</span>
      </div>
    </div>
  );
};

export default EmptyChatState;
