// src/services/bookingService.js
import api from './api.js';

export const bookingService = {
  create: (payload) => api.post('/bookings', payload),
  listMy: (params) => api.get('/bookings', { params }),
  detail: (id) => api.get(`/bookings/${id}`),
  cancel: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
};
