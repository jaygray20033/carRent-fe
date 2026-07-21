// src/services/contactService.js
// Day 36 (UC-28/29/30) — public contact form + public contact settings + admin queue.
// The api.js response interceptor unwraps `{ success, data, ... }`.
import api from './api.js';

export const contactService = {
  // UC-28 — submit a contact message (rate limited 5/h per IP on the server).
  submit: (payload) => api.post('/contact-messages', payload),

  // UC-30 — public contact info { hotline, email, address, hours, social:{...} }.
  publicContact: () => api.get('/site-settings/contact'),
};

// UC-29 — admin contact message queue. ADMIN/OPERATOR only.
export const adminContactService = {
  // GET /admin/contact-messages?status=NEW|READ|REPLIED&page=&size=
  list: (params) => api.get('/admin/contact-messages', { params }),
  // PATCH /admin/contact-messages/:id  body { status?, replyNote? }
  update: (id, payload) => api.patch(`/admin/contact-messages/${id}`, payload),
};

export default contactService;
