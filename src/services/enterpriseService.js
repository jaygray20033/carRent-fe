// src/services/enterpriseService.js — ENT-Day 4 Enterprise Portal API
import api from './api.js';

export const enterpriseService = {
  // Company + membership
  myCompany: () => api.get('/corporate/me/company'),
  myPriceConfig: () => api.get('/corporate/me/price-config'),
  myVasPricing: () => api.get('/corporate/me/vas-pricing'),

  // Bookings
  listBookings: (params) => api.get('/corporate/bookings', { params }),
  getBooking: (id) => api.get(`/corporate/bookings/${id}`),
  createBooking: (payload) => api.post('/corporate/bookings', payload),
  cancelBooking: (id) => api.put(`/corporate/bookings/${id}/cancel`),
  approveBooking: (id, payload) => api.put(`/corporate/bookings/${id}/approve`, payload),
  rejectBooking: (id, payload) => api.put(`/corporate/bookings/${id}/reject`, payload),
  costSummary: (id) => api.get(`/corporate/bookings/${id}/cost-summary`),

  // VAS
  listVasCatalog: () => api.get('/vas'),
  addBookingVas: (id, payload) => api.post(`/corporate/bookings/${id}/vas`, payload),
  removeBookingVas: (id, vasId) => api.delete(`/corporate/bookings/${id}/vas/${vasId}`),

  // SLA
  listBookingViolations: (id) => api.get(`/corporate/bookings/${id}/sla-violations`),
  reportViolation: (id, payload) => api.post(`/corporate/bookings/${id}/sla-violations`, payload),

  // Contract amendments
  listAmendments: () => api.get('/corporate/me/amendments'),
  signAmendmentA: (id) => api.put(`/corporate/me/amendments/${id}/sign-a`),

  // Settlements (admin)
  listSettlements: (params) => api.get('/corporate/settlements', { params }),
  getSettlement: (id) => api.get(`/corporate/settlements/${id}`),
  confirmSettlement: (id) => api.put(`/corporate/settlements/${id}/confirm`),
  disputeSettlement: (id, payload) => api.put(`/corporate/settlements/${id}/dispute`, payload),

  // Dashboard (admin)
  dashboard: (params) => api.get('/corporate/dashboard', { params }),
  tripsReport: (params) =>
    api.get('/corporate/reports/trips', { params, responseType: 'blob' }),

  // Employees (admin)
  listEmployees: (params) => api.get('/corporate/me/company/employees', { params }),
  inviteEmployee: (payload) => api.post('/corporate/me/company/employees', payload),
  updateEmployee: (id, payload) => api.put(`/corporate/me/company/employees/${id}`, payload),
  removeEmployee: (id) => api.delete(`/corporate/me/company/employees/${id}`),
};

export default enterpriseService;
