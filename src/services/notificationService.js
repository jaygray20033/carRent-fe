// src/services/notificationService.js — in-app notification feed (UC-51).
// The api.js response interceptor unwraps `{ success, data, ... }`.
import api from './api.js';

export const notificationService = {
  // GET /me/notifications?unread=&page=&limit=
  list: (params) => api.get('/me/notifications', { params }),

  // PATCH /me/notifications/:id/read
  markRead: (id) => api.patch(`/me/notifications/${id}/read`),

  // PATCH /me/notifications/read-all
  readAll: () => api.patch('/me/notifications/read-all'),
};

export default notificationService;
