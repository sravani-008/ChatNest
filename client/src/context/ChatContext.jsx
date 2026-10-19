import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { conversationService } from '../services/conversationService.js';
import { messageService } from '../services/messageService.js';
import { useAuth } from './AuthContext.jsx';
import { useSocket } from './SocketContext.jsx';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { socketService, isConnected } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState(null);

  // Keep a ref to activeConversationId so socket handlers always have the fresh value
  const activeConversationIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingConversations(true);
    setError(null);
    try {
      const list = await conversationService.getConversations();
      setConversations(list);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError(err.message || 'Failed to load conversations.');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    } else {
      setConversations([]);
      setActiveConversationId(null);
      setMessages([]);
    }
  }, [isAuthenticated, loadConversations]);

  // Load messages when activeConversationId changes
  useEffect(() => {
    if (!activeConversationId || !isAuthenticated) {
      setMessages([]);
      return;
    }

    let isCancelled = false;
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const { messages: fetchedMessages } = await messageService.getMessages(
          activeConversationId,
          { limit: 50 }
        );
        if (!isCancelled) {
          setMessages(fetchedMessages);
          // Mark as read immediately
          await conversationService.markAsRead(activeConversationId);
          // Update local unread count
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConversationId ? { ...c, unreadCount: 0 } : c
            )
          );
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to load messages:', err);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMessages(false);
        }
      }
    };

    fetchMessages();

    return () => {
      isCancelled = true;
    };
  }, [activeConversationId, isAuthenticated]);

  // Real-time socket event listeners
  useEffect(() => {
    if (!socketService || !isConnected) return;

    // New message event
    const handleNewMessage = ({ message }) => {
      const activeId = activeConversationIdRef.current;
      const isCurrentChat = message.conversationId === activeId;

      if (isCurrentChat) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        // Auto mark as read on backend
        conversationService.markAsRead(message.conversationId).catch(() => {});
      }

      setConversations((prev) => {
        const existingIndex = prev.findIndex((c) => c.id === message.conversationId);
        if (existingIndex > -1) {
          const updated = [...prev];
          const conv = { ...updated[existingIndex] };
          conv.lastMessage = {
            id: message.id,
            text: message.text,
            senderId: message.senderId,
            createdAt: message.createdAt,
          };
          conv.updatedAt = message.createdAt;
          if (!isCurrentChat) {
            conv.unreadCount = (conv.unreadCount || 0) + 1;
          }
          // Move conversation to the top
          updated.splice(existingIndex, 1);
          return [conv, ...updated];
        } else {
          // If brand new conversation from another user, reload conversations
          loadConversations();
          return prev;
        }
      });
    };

    // Message sent confirmation event
    const handleMessageSent = ({ message }) => {
      const activeId = activeConversationIdRef.current;
      if (message.conversationId === activeId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }

      setConversations((prev) => {
        const existingIndex = prev.findIndex((c) => c.id === message.conversationId);
        if (existingIndex > -1) {
          const updated = [...prev];
          const conv = { ...updated[existingIndex] };
          conv.lastMessage = {
            id: message.id,
            text: message.text,
            senderId: message.senderId,
            createdAt: message.createdAt,
          };
          conv.updatedAt = message.createdAt;
          updated.splice(existingIndex, 1);
          return [conv, ...updated];
        }
        return prev;
      });
    };

    // Message read event
    const handleMessageRead = ({ conversationId, messageIds, readAt }) => {
      const activeId = activeConversationIdRef.current;
      if (conversationId === activeId) {
        setMessages((prev) =>
          prev.map((msg) =>
            messageIds.includes(msg.id) ? { ...msg, readAt } : msg
          )
        );
      }
    };

    // User online event
    const handleUserOnline = ({ userId }) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.participant && c.participant.id === userId) {
            return {
              ...c,
              participant: { ...c.participant, status: 'online' },
            };
          }
          return c;
        })
      );
    };

    // User offline event
    const handleUserOffline = ({ userId, lastSeen }) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.participant && c.participant.id === userId) {
            return {
              ...c,
              participant: {
                ...c.participant,
                status: 'offline',
                lastSeen: lastSeen || new Date().toISOString(),
              },
            };
          }
          return c;
        })
      );
    };

    const cleanupNew = socketService.on('message:new', handleNewMessage);
    const cleanupSent = socketService.on('message:sent', handleMessageSent);
    const cleanupRead = socketService.on('message:read', handleMessageRead);
    const cleanupOnline = socketService.on('user:online', handleUserOnline);
    const cleanupOffline = socketService.on('user:offline', handleUserOffline);

    return () => {
      cleanupNew();
      cleanupSent();
      cleanupRead();
      cleanupOnline();
      cleanupOffline();
    };
  }, [socketService, isConnected, loadConversations]);

  const selectConversation = useCallback((convId) => {
    setActiveConversationId(convId);
  }, []);

  const startConversationWithUser = useCallback(
    async (participantId) => {
      try {
        const conv = await conversationService.createOrGetConversation(participantId);
        setConversations((prev) => {
          const exists = prev.some((c) => c.id === conv.id);
          if (exists) {
            return prev.map((c) => (c.id === conv.id ? conv : c));
          }
          return [conv, ...prev];
        });
        setActiveConversationId(conv.id);
        return conv;
      } catch (err) {
        console.error('Failed to start conversation:', err);
        throw err;
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (text) => {
      if (!activeConversationId || !text.trim()) return;
      setIsSendingMessage(true);
      try {
        const sentMessage = await messageService.sendMessage(activeConversationId, text.trim());
        setMessages((prev) => {
          if (prev.some((m) => m.id === sentMessage.id)) return prev;
          return [...prev, sentMessage];
        });

        // Update conversation lastMessage
        setConversations((prev) => {
          const existingIndex = prev.findIndex((c) => c.id === activeConversationId);
          if (existingIndex > -1) {
            const updated = [...prev];
            const conv = { ...updated[existingIndex] };
            conv.lastMessage = {
              id: sentMessage.id,
              text: sentMessage.text,
              senderId: sentMessage.senderId,
              createdAt: sentMessage.createdAt,
            };
            conv.updatedAt = sentMessage.createdAt;
            updated.splice(existingIndex, 1);
            return [conv, ...updated];
          }
          return prev;
        });

        return sentMessage;
      } catch (err) {
        console.error('Failed to send message:', err);
        throw err;
      } finally {
        setIsSendingMessage(false);
      }
    },
    [activeConversationId]
  );

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const value = {
    conversations,
    activeConversationId,
    activeConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isSendingMessage,
    error,
    loadConversations,
    selectConversation,
    startConversationWithUser,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
