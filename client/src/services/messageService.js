import { api } from './api.js';

export const messageService = {
  async getMessages(conversationId, { limit = 50, before = null } = {}) {
    let query = `?limit=${limit}`;
    if (before) {
      query += `&before=${encodeURIComponent(before)}`;
    }
    const res = await api.get(`/conversations/${conversationId}/messages${query}`);
    return {
      messages: res.messages || [],
      hasMore: !!res.hasMore,
    };
  },

  async sendMessage(conversationId, text) {
    const res = await api.post(`/conversations/${conversationId}/messages`, { text });
    return res.message;
  },
};
