// src/services/reviewService.js — Review API (UC-50).
// The api.js response interceptor unwraps `{ success, data, ... }`.
import api from './api.js';

export const reviewService = {
  // POST /bookings/:id/review — { rating, content?, photos?[] }
  create: (bookingId, payload) => api.post(`/bookings/${bookingId}/review`, payload),

  // GET /cars/:id/reviews?page=&limit=
  listByVehicle: (vehicleId, params) => api.get(`/cars/${vehicleId}/reviews`, { params }),

  // GET /me/reviews — the user's own reviews (any status)
  listMine: (params) => api.get('/me/reviews', { params }),

  // GET /me/reviews/reviewable — COMPLETED bookings not yet reviewed
  reviewable: () => api.get('/me/reviews/reviewable'),
};

export default reviewService;
