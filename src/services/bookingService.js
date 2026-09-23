// src/services/bookingService.js
import api from './api.js';

export const bookingService = {
  // UC-14 — create a DRAFT + 15-min hold
  createDraft: (payload) => api.post('/bookings/draft', payload),
  // UC-15 — update insurance / dropoff on a DRAFT, recompute price
  updateDraft: (id, payload) => api.patch(`/bookings/${id}`, payload),
  // UC-16/17 — confirm a DRAFT → PENDING_PAYMENT (optionally apply a coupon)
  confirm: (id, payload) => api.post(`/bookings/${id}/confirm`, payload),
  listMy: (params) => api.get('/bookings', { params }),
  detail: (id) => api.get(`/bookings/${id}`),
  cancel: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
};
