import { api } from './api.js';

export const conversationService = {
  async getConversations() {
    const res = await api.get('/conversations');
    return res.conversations || [];
  },

  async createOrGetConversation(participantId) {
    const res = await api.post('/conversations', { participantId });
    return res.conversation;
  },

  async getConversationById(conversationId) {
    const res = await api.get(`/conversations/${conversationId}`);
    return res.conversation;
  },

  async markAsRead(conversationId) {
    return api.patch(`/conversations/${conversationId}/read`, {});
  },
};
