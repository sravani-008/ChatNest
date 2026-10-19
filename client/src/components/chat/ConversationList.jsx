import React, { useState } from 'react';
import ConversationItem from './ConversationItem.jsx';
import { Search, Plus, MessageSquarePlus, X } from 'lucide-react';
import { Spinner } from '../common/StatusIndicator.jsx';

export const ConversationList = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onOpenDiscovery,
  isLoading,
  currentUserId,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = conversations.filter((c) => {
    if (!filterQuery.trim()) return true;
    const name = c.participant?.name || '';
    const email = c.participant?.email || '';
    const q = filterQuery.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  return (
    <div className="conversation-list-container">
      {/* Search & New Chat Bar */}
      <div className="conv-search-header">
        <div className="conv-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
          {filterQuery && (
            <button className="clear-search-btn" onClick={() => setFilterQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>
        <button
          className="btn-new-chat"
          onClick={onOpenDiscovery}
          title="New Conversation"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Conversations Scroll Area */}
      <div className="conv-scroll-area">
        {isLoading && conversations.length === 0 ? (
          <div className="conv-loading-state">
            <Spinner size="md" />
            <span>Loading conversations...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="conv-empty-state">
            <div className="empty-icon-circle">
              <MessageSquarePlus size={24} />
            </div>
            <h4>{filterQuery ? 'No chats match search' : 'No conversations yet'}</h4>
            <p>
              {filterQuery
                ? 'Try searching with a different name or email.'
                : 'Start your first conversation with other members.'}
            </p>
            <button className="btn-secondary" onClick={onOpenDiscovery}>
              Start a Conversation
            </button>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              onSelect={onSelectConversation}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
