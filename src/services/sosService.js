// src/services/sosService.js
// Day 39 (UC-34/35/36) — roadside SOS requests + operator dispatch.
// The api.js response interceptor unwraps `{ success, data, ... }`.
import api from './api.js';

export const sosService = {
  // UC-34 — raise an SOS for an IN_USE booking (optional photos, field "images").
  submit: ({ bookingId, lat, lng, issueType, description }, files = []) => {
    const form = new FormData();
    form.append('bookingId', bookingId);
    form.append('lat', lat);
    form.append('lng', lng);
    form.append('issueType', issueType);
    if (description) form.append('description', description);
    for (const f of files) form.append('images', f);
    return api.post('/sos-requests', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // UC-35 — my SOS requests for a booking (status polling).
  listForBooking: (bookingId) => api.get('/sos-requests', { params: { bookingId } }),

  detail: (id) => api.get(`/sos-requests/${id}`),
};

// Operator dispatch queue. ADMIN/OPERATOR only.
export const adminSosService = {
  // GET /admin/sos-requests?status=&page=&size=
  list: (params) => api.get('/admin/sos-requests', { params }),
  detail: (id) => api.get(`/admin/sos-requests/${id}`),
  // PATCH /admin/sos-requests/:id  body { status, driverName?, driverPhone?, etaMinutes?, resolutionNote? }
  update: (id, payload) => api.patch(`/admin/sos-requests/${id}`, payload),
  // POST /admin/sos-requests/:id/replacement  body { vehicleId, ... }
  createReplacement: (id, payload) => api.post(`/admin/sos-requests/${id}/replacement`, payload),
};

export default sosService;
