// src/services/userService.js
import api from './api.js';

export const userService = {
  me: () => api.get('/users/me'),
  updateMe: (payload) => api.put('/users/me', payload),
};
