// src/services/paymentService.js
import api from './api.js';

export const paymentService = {
  checkout: (payload) => api.post('/payments/checkout', payload),
  listMine: (params) => api.get('/payments/me', { params }),
  detail: (id) => api.get(`/payments/${id}`),
  mockConfirm: (id) => api.post(`/payments/${id}/mock-confirm`, {}),
};
