import { api } from './api.js';

export const authService = {
  async loginWithGoogle(payload) {
    const body = typeof payload === 'string' ? { credential: payload } : payload;
    const data = await api.post('/auth/google', body);
    if (data.token) {
      api.setToken(data.token);
    }
    return data;
  },

  async devLogin({ email, name, avatarUrl }) {
    const data = await api.post('/auth/dev-login', { email, name, avatarUrl });
    if (data.token) {
      api.setToken(data.token);
    }
    return data;
  },

  async getMe() {
    return api.get('/auth/me');
  },

  async logout() {
    try {
      await api.post('/auth/logout', {});
    } finally {
      api.setToken(null);
    }
  },

  getToken() {
    return api.getToken();
  },
};
