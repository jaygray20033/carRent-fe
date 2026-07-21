// src/services/agentService.js
// Day 38 (UC-32/33) — agent (car owner) applications + admin review.
// The api.js response interceptor unwraps `{ success, data, ... }`.
import api from './api.js';

export const agentService = {
  // UC-32 — submit an application (optional KYC file, multipart field "image").
  submit: (payload, file) => {
    const form = new FormData();
    for (const [k, v] of Object.entries(payload)) {
      if (v !== undefined && v !== null && v !== '') form.append(k, v);
    }
    if (file) form.append('image', file);
    return api.post('/agent-applications', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // UC-33 — my latest application status.
  mine: () => api.get('/me/agent-application'),
};

// Admin review queue. ADMIN/OPERATOR only.
export const adminAgentService = {
  // GET /admin/agent-applications?status=PENDING|APPROVED|REJECTED&page=&size=
  list: (params) => api.get('/admin/agent-applications', { params }),
  detail: (id) => api.get(`/admin/agent-applications/${id}`),
  // PATCH /admin/agent-applications/:id  body { status, reviewNote? }
  review: (id, payload) => api.patch(`/admin/agent-applications/${id}`, payload),
};

export default agentService;
