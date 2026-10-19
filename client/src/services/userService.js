import { api } from './api.js';

export const userService = {
  async getUsers(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await api.get(`/users${query}`);
    return res.users || [];
  },

  async getUserById(userId) {
    const res = await api.get(`/users/${userId}`);
    return res.user;
  },

  async getMyProfile() {
    const res = await api.get('/profile');
    return res.user;
  },

  async updateMyProfile({ name, bio }) {
    const res = await api.patch('/profile', { name, bio });
    return res.user;
  },
};
