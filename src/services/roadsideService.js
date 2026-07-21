// src/services/roadsideService.js
// Day 37 (UC-31) — public roadside/rescue stations + admin CRUD.
// The api.js response interceptor unwraps `{ success, data, ... }`.
import api from './api.js';

export const roadsideService = {
  // UC-31 — active stations. With lat/lng, server returns nearest-first
  // (+ distanceKm) within `radius` km (default 50).
  list: (params) => api.get('/roadside-stations', { params }),
};

// Admin rescue station CRUD. ADMIN/OPERATOR only.
export const adminRescueStationService = {
  // GET /admin/rescue-stations?q=&isActive=&page=&size=
  list: (params) => api.get('/admin/rescue-stations', { params }),
  detail: (id) => api.get(`/admin/rescue-stations/${id}`),
  create: (payload) => api.post('/admin/rescue-stations', payload),
  update: (id, payload) => api.patch(`/admin/rescue-stations/${id}`, payload),
  remove: (id) => api.delete(`/admin/rescue-stations/${id}`),
};

export default roadsideService;
