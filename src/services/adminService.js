// src/services/adminService.js
// Admin API surface (Day 23/24 — UC-56 blog CRUD, UC-57 coupon CRUD,
// plus comment moderation from UC-24). All routes require ADMIN/OPERATOR.
import api from './api.js';

export const adminPostService = {
  list: (params) => api.get('/admin/posts', { params }),
  detail: (id) => api.get(`/admin/posts/${id}`),
  create: (payload) => api.post('/admin/posts', payload),
  update: (id, payload) => api.patch(`/admin/posts/${id}`, payload),
  remove: (id) => api.delete(`/admin/posts/${id}`),
};

export const adminCategoryService = {
  list: () => api.get('/admin/post-categories'),
  create: (payload) => api.post('/admin/post-categories', payload),
  update: (id, payload) => api.patch(`/admin/post-categories/${id}`, payload),
  remove: (id) => api.delete(`/admin/post-categories/${id}`),
};

export const adminTagService = {
  list: () => api.get('/admin/tags'),
  create: (payload) => api.post('/admin/tags', payload),
  update: (id, payload) => api.patch(`/admin/tags/${id}`, payload),
  remove: (id) => api.delete(`/admin/tags/${id}`),
};

export const adminCommentService = {
  // UC-24 moderation queue — filter by status (PENDING default on the page)
  list: (params) => api.get('/admin/comments', { params }),
  // PATCH status → APPROVED | REJECTED
  moderate: (id, status) => api.patch(`/admin/comments/${id}`, { status }),
};

export const adminCouponService = {
  list: (params) => api.get('/admin/coupons', { params }),
  detail: (id) => api.get(`/admin/coupons/${id}`),
  create: (payload) => api.post('/admin/coupons', payload),
  update: (id, payload) => api.patch(`/admin/coupons/${id}`, payload),
  remove: (id) => api.delete(`/admin/coupons/${id}`),
};

// Day 31 — UC-52 dashboard KPIs
export const adminDashboardService = {
  // GET /admin/dashboard?from=&to=  (from/to are ISO date strings, optional)
  kpis: (params) => api.get('/admin/dashboard', { params }),
};

// Day 35 — UC-59 reports
export const adminReportsService = {
  // GET /admin/reports/revenue?from=&to=&group=day|month
  revenue: (params) => api.get('/admin/reports/revenue', { params }),
  // GET /admin/reports/booking?from=&to=
  booking: (params) => api.get('/admin/reports/booking', { params }),
  // GET /admin/reports/top-vehicles?from=&to=&limit=
  topVehicles: (params) => api.get('/admin/reports/top-vehicles', { params }),
  // GET /admin/reports/b2b-vs-c2c?month=YYYY-MM (UC-73)
  b2bVsC2c: (params) => api.get('/admin/reports/b2b-vs-c2c', { params }),
  // File download — format ∈ csv | excel | pdf. Returns a Blob (interceptor unwraps res.data).
  exportRevenue: (params) =>
    api.get('/admin/reports/revenue', { params, responseType: 'blob' }),
};

// Day 35 — UC-60 site settings
export const adminSettingsService = {
  getAll: () => api.get('/admin/settings'),
  // PUT /admin/settings — body { settings: { key: value, ... } }
  update: (settings) => api.put('/admin/settings', { settings }),
};

// Day 32 — UC-53 advanced vehicle management
export const adminVehicleService = {
  list: (params) => api.get('/admin/vehicles', { params }),
  detail: (id) => api.get(`/admin/vehicles/${id}`),
  create: (payload) => api.post('/admin/vehicles', payload),
  update: (id, payload) => api.patch(`/admin/vehicles/${id}`, payload),
  remove: (id) => api.delete(`/admin/vehicles/${id}`),
  // Quick action — status ∈ AVAILABLE | MAINTENANCE | RETIRED
  updateStatus: (id, status) => api.patch(`/admin/vehicles/${id}/status`, { status }),
  // Booking history of a single vehicle
  bookings: (id, params) => api.get(`/admin/vehicles/${id}/bookings`, { params }),
  // Multipart image upload — field name "images", up to 10 files
  uploadImages: (id, formData) =>
    api.post(`/admin/vehicles/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const adminVehicleModelService = {
  list: (params) => api.get('/admin/vehicle-models', { params }),
  detail: (id) => api.get(`/admin/vehicle-models/${id}`),
  create: (payload) => api.post('/admin/vehicle-models', payload),
  update: (id, payload) => api.patch(`/admin/vehicle-models/${id}`, payload),
  remove: (id) => api.delete(`/admin/vehicle-models/${id}`),
};

// Day 33 — UC-54 admin booking management
export const adminBookingService = {
  // GET /admin/bookings?status=&from=&to=&q=&page=&limit=
  list: (params) => api.get('/admin/bookings', { params }),
  detail: (id) => api.get(`/admin/bookings/${id}`),
  // Manual offline settlement — method ∈ BANK_TRANSFER | CASH
  confirmPayment: (id, payload) => api.post(`/admin/bookings/${id}/confirm-payment`, payload),
  addNote: (id, note) => api.post(`/admin/bookings/${id}/note`, { note }),
  start: (id) => api.post(`/admin/bookings/${id}/start`),
  return: (id, payload) => api.post(`/admin/bookings/${id}/return`, payload),
  refund: (id, payload) => api.post(`/admin/bookings/${id}/refund`, payload),
};

// Day 34 — UC-55 admin user management
export const adminUserService = {
  // GET /admin/users?role=&status=&q=&page=&limit=
  list: (params) => api.get('/admin/users', { params }),
  detail: (id) => api.get(`/admin/users/${id}`),
  // PATCH status ∈ ACTIVE | LOCKED (+ reason); LOCK revokes all sessions
  updateStatus: (id, payload) => api.patch(`/admin/users/${id}/status`, payload),
  // PATCH role (ADMIN only) — role ∈ CUSTOMER | ADMIN | OPERATOR | AGENT
  updateRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  // POST manual wallet adjust — type ∈ CREDIT | DEBIT
  adjustWallet: (id, payload) => api.post(`/admin/users/${id}/wallet/adjust`, payload),
};

// B2B Day 7 — UC-61/72 corporate clients + booking queue
export const adminCorporateService = {
  listClients: (params) => api.get('/admin/corporate-clients', { params }),
  getClient: (id) => api.get(`/admin/corporate-clients/${id}`),
  createClient: (payload) => api.post('/admin/corporate-clients', payload),
  updateClient: (id, payload) => api.put(`/admin/corporate-clients/${id}`, payload),
  getPriceConfig: (id) => api.get(`/admin/corporate-clients/${id}/price-config`),
  updatePriceConfig: (id, priceConfig) =>
    api.put(`/admin/corporate-clients/${id}/price-config`, { priceConfig }),
  listSettlements: (id, params) =>
    api.get(`/admin/corporate-clients/${id}/settlements`, { params }),
  createSettlement: (id, payload) =>
    api.post(`/admin/corporate-clients/${id}/settlements`, payload),
  getDashboard: (id, params) =>
    api.get(`/admin/corporate-clients/${id}/dashboard`, { params }),
  listBookings: (params) => api.get('/admin/corporate-bookings', { params }),
  assignDriver: (id, payload) =>
    api.put(`/admin/corporate-bookings/${id}/assign-driver`, payload),
  startBooking: (id) => api.put(`/admin/corporate-bookings/${id}/start`),
  confirmOtorent: (id) => api.put(`/admin/corporate-bookings/${id}/confirm-otorent`),
  getSettlement: (id) => api.get(`/admin/settlements/${id}`),
  sendSettlement: (id) => api.put(`/admin/settlements/${id}/send`),
  markSettlementPaid: (id, payload) =>
    api.put(`/admin/settlements/${id}/mark-paid`, payload || {}),
  exportSettlementPdf: (id) =>
    api.get(`/admin/settlements/${id}/export`, { responseType: 'blob' }),
};

export default {
  posts: adminPostService,
  categories: adminCategoryService,
  tags: adminTagService,
  comments: adminCommentService,
  coupons: adminCouponService,
  dashboard: adminDashboardService,
  vehicles: adminVehicleService,
  vehicleModels: adminVehicleModelService,
  bookings: adminBookingService,
  users: adminUserService,
  reports: adminReportsService,
  settings: adminSettingsService,
  corporate: adminCorporateService,
};
