// src/services/partnerService.js
// Public partner onboarding — supplier (nhà xe) applications + admin review.
// The api.js response interceptor unwraps `{ success, data, ... }`.
import api from './api.js';

export const partnerService = {
  // Submit a supplier application (optional license file, multipart field "image").
  submitSupplier: (payload, file) => {
    const form = new FormData();
    for (const [k, v] of Object.entries(payload)) {
      if (v !== undefined && v !== null && v !== '') form.append(k, v);
    }
    if (file) form.append('image', file);
    return api.post('/supplier-applications', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // My latest supplier application status.
  mySupplier: () => api.get('/me/supplier-application'),
};

// Admin review queue. ADMIN/OPERATOR only.
export const adminSupplierApplicationService = {
  list: (params) => api.get('/admin/supplier-applications', { params }),
  detail: (id) => api.get(`/admin/supplier-applications/${id}`),
  // PATCH body { status, reviewNote?, commissionRate? }
  review: (id, payload) => api.patch(`/admin/supplier-applications/${id}`, payload),
};

export default partnerService;
