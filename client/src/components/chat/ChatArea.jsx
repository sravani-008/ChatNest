import React from 'react';
import ChatHeader from './ChatHeader.jsx';
import MessageList from './MessageList.jsx';
import MessageInput from './MessageInput.jsx';
import EmptyChatState from './EmptyChatState.jsx';

export const ChatArea = ({
  conversation,
  messages,
  currentUserId,
  isLoadingMessages,
  isSendingMessage,
  onSendMessage,
  onBack,
  onOpenDiscovery,
  onOpenInfo,
}) => {
  if (!conversation) {
    return <EmptyChatState onOpenDiscovery={onOpenDiscovery} />;
  }

  return (
    <div className="chat-main-area">
      <ChatHeader
        participant={conversation.participant}
        onBack={onBack}
        onOpenInfo={onOpenInfo}
      />

      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isLoading={isLoadingMessages}
      />

      <MessageInput
        onSendMessage={onSendMessage}
        isSending={isSendingMessage}
      />
    </div>
  );
};

export default ChatArea;
