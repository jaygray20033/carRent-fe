// src/services/paymentService.js
import api from './api.js';

export const paymentService = {
  checkout: (payload) => api.post('/payments/checkout', payload),
  detail: (id) => api.get(`/payments/${id}`),
  mockConfirm: (id) => api.post(`/payments/${id}/mock-confirm`, {}),
};
