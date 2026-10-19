import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useChat } from '../context/ChatContext.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import ConversationList from '../components/chat/ConversationList.jsx';
import ChatArea from '../components/chat/ChatArea.jsx';
import UserDiscoveryModal from '../components/chat/UserDiscoveryModal.jsx';
import ProfileModal from '../components/profile/ProfileModal.jsx';

export const ChatPage = ({ initialConversationId = null, onNavigate }) => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversationId,
    activeConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isSendingMessage,
    selectConversation,
    startConversationWithUser,
    sendMessage,
  } = useChat();

  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sync initial conversation ID from route if provided
  useEffect(() => {
    if (initialConversationId && initialConversationId !== activeConversationId) {
      selectConversation(initialConversationId);
    }
  }, [initialConversationId, activeConversationId, selectConversation]);

  const handleSelectConversation = (convId) => {
    selectConversation(convId);
    if (onNavigate) {
      onNavigate(`/chat/${convId}`);
    }
  };

  const handleBackToConversations = () => {
    selectConversation(null);
    if (onNavigate) {
      onNavigate('/chat');
    }
  };

  const handleSelectUserFromDiscovery = async (userId) => {
    try {
      const conv = await startConversationWithUser(userId);
      if (conv && conv.id) {
        if (onNavigate) {
          onNavigate(`/chat/${conv.id}`);
        }
      }
    } catch (err) {
      console.error('Failed to start chat with user:', err);
    }
  };

  const hasActiveChat = Boolean(activeConversationId);

  return (
    <div className={`chat-app-layout ${hasActiveChat ? 'has-active-chat' : 'no-active-chat'}`}>
      {/* Left Sidebar */}
      <aside className="chat-sidebar">
        <Navbar
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenDiscovery={() => setIsDiscoveryOpen(true)}
        />

        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onOpenDiscovery={() => setIsDiscoveryOpen(true)}
          isLoading={isLoadingConversations}
          currentUserId={user?.id}
        />
      </aside>

      {/* Right Chat Area */}
      <main className="chat-content-pane">
        <ChatArea
          conversation={activeConversation}
          messages={messages}
          currentUserId={user?.id}
          isLoadingMessages={isLoadingMessages}
          isSendingMessage={isSendingMessage}
          onSendMessage={sendMessage}
          onBack={handleBackToConversations}
          onOpenDiscovery={() => setIsDiscoveryOpen(true)}
          onOpenInfo={() => setIsProfileOpen(true)}
        />
      </main>

      {/* Modals */}
      <UserDiscoveryModal
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        onSelectUser={handleSelectUserFromDiscovery}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};

export default ChatPage;
