// src/services/supplierService.js — Marketplace Phase E
// Two API surfaces:
//   adminSupplierService  → /admin/suppliers/*        (ADMIN / OPERATOR)
//   supplierPortalService → /supplier/*               (SUPPLIER_ADMIN / SUPPLIER_DRIVER)
import api from './api.js';

// ── CarGoGo admin surface ─────────────────────────────────────────────
export const adminSupplierService = {
  // Supplier CRUD
  list: (params) => api.get('/admin/suppliers', { params }),
  get: (id) => api.get(`/admin/suppliers/${id}`),
  create: (payload) => api.post('/admin/suppliers', payload),
  update: (id, payload) => api.put(`/admin/suppliers/${id}`, payload),
  deactivate: (id) => api.delete(`/admin/suppliers/${id}`),

  // Members
  listMembers: (id) => api.get(`/admin/suppliers/${id}/members`),
  inviteMember: (id, payload) => api.post(`/admin/suppliers/${id}/members`, payload),
  updateMember: (id, memberId, payload) =>
    api.put(`/admin/suppliers/${id}/members/${memberId}`, payload),
  removeMember: (id, memberId) => api.delete(`/admin/suppliers/${id}/members/${memberId}`),

  // Commission report
  commissionReport: (id, params) =>
    api.get(`/admin/suppliers/${id}/commission-report`, { params }),

  // Payout settlements
  listSettlements: (id, params) =>
    api.get(`/admin/suppliers/${id}/settlements`, { params }),
  createSettlement: (id, payload) =>
    api.post(`/admin/suppliers/${id}/settlements`, payload),
  getSettlement: (id, settlementId) =>
    api.get(`/admin/suppliers/${id}/settlements/${settlementId}`),
  verifySettlement: (id, settlementId) =>
    api.put(`/admin/suppliers/${id}/settlements/${settlementId}/verify`),
  rejectSettlement: (id, settlementId, payload) =>
    api.put(`/admin/suppliers/${id}/settlements/${settlementId}/reject`, payload),
  markSettlementPaid: (id, settlementId, payload) =>
    api.put(`/admin/suppliers/${id}/settlements/${settlementId}/mark-paid`, payload),

  // LDX dispatch record (JSON / PDF / CSV) lives on the corporate-booking route.
  dispatchRecordUrl: (bookingId, format = 'pdf') =>
    `/admin/corporate-bookings/${bookingId}/dispatch-record?format=${format}`,
  dispatchRecord: (bookingId, format) =>
    api.get(`/admin/corporate-bookings/${bookingId}/dispatch-record`, {
      params: format ? { format } : undefined,
      ...(format && format !== 'json' ? { responseType: 'blob' } : {}),
    }),
};

// ── Supplier portal surface ───────────────────────────────────────────
export const supplierPortalService = {
  me: () => api.get('/supplier/me'),
  acceptInvite: (token) => api.post('/supplier/invite/accept', { token }),

  // Shareable multi-use join link
  previewInviteLink: (token) => api.get(`/supplier/invite/link/${encodeURIComponent(token)}`),
  joinViaLink: (token) => api.post('/supplier/invite/link/join', { token }),
  listInviteLinks: () => api.get('/supplier/me/invite-links'),
  createInviteLink: (payload) => api.post('/supplier/me/invite-links', payload),
  revokeInviteLink: (linkId) => api.delete(`/supplier/me/invite-links/${linkId}`),

  // Bookings
  listBookings: (params) => api.get('/supplier/bookings', { params }),
  getBooking: (id) => api.get(`/supplier/bookings/${id}`),
  costSummary: (id) => api.get(`/supplier/bookings/${id}/cost-summary`),
  assignDriver: (id, payload) => api.put(`/supplier/bookings/${id}/assign-driver`, payload),
  reject: (id, payload) => api.put(`/supplier/bookings/${id}/reject`, payload),
  start: (id) => api.put(`/supplier/bookings/${id}/start`),
  complete: (id, payload) => api.put(`/supplier/bookings/${id}/complete`, payload),

  // Trip expenses (driver logs tolls, parking, overtime…)
  listExpenses: (id) => api.get(`/supplier/bookings/${id}/expenses`),
  addExpense: (id, payload) => api.post(`/supplier/bookings/${id}/expenses`, payload),
  deleteExpense: (id, expenseId) =>
    api.delete(`/supplier/bookings/${id}/expenses/${expenseId}`),

  // Members (Supplier Admin manages own drivers)
  listMembers: () => api.get('/supplier/me/members'),
  inviteMember: (payload) => api.post('/supplier/me/members', payload),
  updateMember: (memberId, payload) => api.put(`/supplier/me/members/${memberId}`, payload),
  resendMemberInvite: (memberId) =>
    api.post(`/supplier/me/members/${memberId}/resend-invite`),
  removeMember: (memberId) => api.delete(`/supplier/me/members/${memberId}`),

  // Payout settlements
  listSettlements: (params) => api.get('/supplier/settlements', { params }),
  getSettlement: (settlementId) => api.get(`/supplier/settlements/${settlementId}`),
  submitDocuments: (settlementId, payload) =>
    api.post(`/supplier/settlements/${settlementId}/documents`, payload),
};

// Shared UI helpers ────────────────────────────────────────────────────
export const SETTLEMENT_STATUS_LABEL = {
  PENDING_DOCUMENTS: 'Chờ nộp hồ sơ',
  DOCUMENTS_SUBMITTED: 'Đã nộp — chờ duyệt',
  DOCUMENTS_REJECTED: 'Bị từ chối — cần bổ sung',
  VERIFIED: 'Đã duyệt — chờ thanh toán',
  PAID: 'Đã thanh toán',
};

export const SETTLEMENT_STATUS_BADGE = {
  PENDING_DOCUMENTS: 'bg-ink-100 text-ink-600',
  DOCUMENTS_SUBMITTED: 'bg-sky-100 text-sky-700',
  DOCUMENTS_REJECTED: 'bg-red-100 text-red-700',
  VERIFIED: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
};

export const TRIP_EXPENSE_TYPE_LABEL = {
  TOLL_ROAD: 'Phí cầu đường / trạm thu phí',
  PARKING: 'Phí gửi xe / bến bãi',
  OVERTIME: 'Phụ phí tăng ca',
  EXTRA_KM: 'Phụ phí vượt km',
  ONE_WAY_KM: 'Phí một chiều',
  OVERNIGHT: 'Phụ phí lưu đêm',
  OTHER: 'Chi phí khác',
};

export const TRIP_EXPENSE_TYPES = Object.keys(TRIP_EXPENSE_TYPE_LABEL);

export const BOOKING_STATUS_LABEL = {
  DISPATCHED: 'Mới điều phối',
  DRIVER_ASSIGNED: 'Đã phân tài xế',
  IN_PROGRESS: 'Đang chạy',
  PENDING_CONFIRM: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SETTLED: 'Đã quyết toán',
  CANCELLED: 'Đã huỷ',
  APPROVED: 'Đã duyệt',
};

export default { adminSupplierService, supplierPortalService };
