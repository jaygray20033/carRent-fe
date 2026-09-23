// src/services/enterpriseService.js — ENT-Day 4 Enterprise Portal API
import api from './api.js';

// Corporate settlement lifecycle: DRAFT (CarGoGo building) → SENT (awaiting the
// company) → CONFIRMED (company accepted) → PAID (CarGoGo marked invoice paid).
// DISPUTED is a company push-back from SENT. The company only ever sees SENT
// onward; DRAFT is CarGoGo-internal.
export const SETTLEMENT_STATUS_LABEL = {
  DRAFT: 'Nháp',
  SENT: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  DISPUTED: 'Đang phản hồi',
  PAYMENT_DECLARED: 'Đã báo thanh toán',
  PAID: 'Đã thanh toán',
};

export const SETTLEMENT_STATUS_BADGE = {
  DRAFT: 'bg-ink-100 text-ink-500',
  SENT: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  DISPUTED: 'bg-red-100 text-red-700',
  PAYMENT_DECLARED: 'bg-indigo-100 text-indigo-700',
  PAID: 'bg-sky-100 text-sky-700',
};

export const enterpriseService = {
  // Public self-registration — instant activation (no approval).
  selfRegister: (payload) => api.post('/corporate/self-register', payload),

  // Invite accept — any authenticated user (not yet a member).
  acceptInvite: (token) => api.post('/corporate/invite/accept', { token }),

  // Shareable multi-use join link
  previewInviteLink: (token) => api.get(`/corporate/invite/link/${encodeURIComponent(token)}`),
  joinViaLink: (token) => api.post('/corporate/invite/link/join', { token }),
  listInviteLinks: () => api.get('/corporate/me/company/invite-links'),
  createInviteLink: (payload) => api.post('/corporate/me/company/invite-links', payload),
  revokeInviteLink: (linkId) => api.delete(`/corporate/me/company/invite-links/${linkId}`),

  // Company + membership
  myCompany: () => api.get('/corporate/me/company'),
  updateMyCompany: (payload) => api.patch('/corporate/me/company', payload),
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

  // Post-trip cost confirmation (PENDING_CONFIRM → CONFIRMED).
  listExpenses: (id) => api.get(`/corporate/bookings/${id}/expenses`),
  approveExpense: (id, expenseId, approved) =>
    api.put(`/corporate/bookings/${id}/expenses/${expenseId}/approve`, { approved }),
  confirmEmployee: (id) => api.put(`/corporate/bookings/${id}/confirm-employee`),
  confirmCorporate: (id) => api.put(`/corporate/bookings/${id}/confirm-corporate`),
  // Gộp Mức 1+2: duyệt hết chi phí + xác nhận + chọn hình thức thanh toán trong 1 bước.
  // paymentMode: 'PAY_NOW' (tạo bảng kê lẻ ngay khi CarGoGo chốt) | 'ON_CREDIT' (gom kỳ tháng).
  confirmAndFinalize: (id, paymentMode) =>
    api.put(`/corporate/bookings/${id}/confirm-and-finalize`, { paymentMode }),

  // VAS
  listVasCatalog: () => api.get('/vas'),
  addBookingVas: (id, payload) => api.post(`/corporate/bookings/${id}/vas`, payload),
  removeBookingVas: (id, vasId) => api.delete(`/corporate/bookings/${id}/vas/${vasId}`),

  // SLA
  mySla: () => api.get('/corporate/me/sla'),
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
  getSettlementQr: (id) => api.get(`/corporate/settlements/${id}/qr`),

  // Manual bank-transfer: báo "đã chuyển khoản" (always alerts OtoRent admin),
  // then optionally upload the transfer-proof image (multipart field "image").
  declareSettlementPaid: (id) => api.put(`/corporate/settlements/${id}/declare-paid`),
  uploadSettlementProof: (id, file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post(`/corporate/settlements/${id}/proof`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Dashboard (admin)
  dashboard: (params) => api.get('/corporate/dashboard', { params }),
  tripsReport: (params) =>
    api.get('/corporate/reports/trips', { params, responseType: 'blob' }),

  // Employees (admin)
  listEmployees: (params) => api.get('/corporate/me/company/employees', { params }),
  inviteEmployee: (payload) => api.post('/corporate/me/company/employees', payload),
  resendEmployeeInvite: (id) =>
    api.post(`/corporate/me/company/employees/${id}/resend-invite`),
  updateEmployee: (id, payload) => api.put(`/corporate/me/company/employees/${id}`, payload),
  removeEmployee: (id) => api.delete(`/corporate/me/company/employees/${id}`),
};

export default enterpriseService;
