// src/services/addressService.js — Address book API (UC-42, UC-43).
// The api.js response interceptor unwraps `{ success, data, ... }`.
import api from './api.js';

export const addressService = {
  list: () => api.get('/me/addresses'),
  create: (payload) => api.post('/me/addresses', payload),
  update: (id, payload) => api.patch(`/me/addresses/${id}`, payload),
  remove: (id) => api.delete(`/me/addresses/${id}`),
  setDefault: (id) => api.patch(`/me/addresses/${id}/default`),
};

export default addressService;
