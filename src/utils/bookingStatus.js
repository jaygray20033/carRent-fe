// src/utils/bookingStatus.js — Booking status labels, colors & timeline order

export const STATUS_LABEL = {
  DRAFT: 'Nháp',
  PENDING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  IN_USE: 'Đang dùng',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
};

export const STATUS_COLOR = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  IN_USE: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
};

// Tabs shown on MyBookingsPage. `value: null` means "Tất cả" (no filter).
export const BOOKING_TABS = [
  { value: null, label: 'Tất cả' },
  { value: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'IN_USE', label: 'Đang dùng' },
  { value: 'COMPLETED', label: 'Hoàn tất' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

// Normal happy-path lifecycle used to render the status timeline.
export const TIMELINE_STEPS = [
  { status: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
  { status: 'CONFIRMED', label: 'Đã xác nhận' },
  { status: 'IN_USE', label: 'Đang dùng' },
  { status: 'COMPLETED', label: 'Hoàn tất' },
];

export const statusLabel = (s) => STATUS_LABEL[s] || s;
export const statusColor = (s) => STATUS_COLOR[s] || 'bg-gray-100 text-gray-700';

// Can the user cancel this booking? (UC-20: only before the car is in use)
export const canCancel = (status) =>
  ['DRAFT', 'PENDING_PAYMENT', 'CONFIRMED'].includes(status);

// Does this booking still need payment?
export const needsPayment = (status) => status === 'PENDING_PAYMENT';

// UC-20 refund schedule — mirrors the backend so the modal can preview the
// expected refund before the user confirms. Returns null after pickup (the
// booking can no longer be cancelled).
//   ≥ 48h  → 100%
//   24-48h → 70%
//   < 24h  → 30%
export const estimateRefundPercent = (pickupAt, now = new Date()) => {
  if (!pickupAt) return null;
  const hours = (new Date(pickupAt).getTime() - now.getTime()) / 36e5;
  if (hours < 0) return null;
  if (hours >= 48) return 100;
  if (hours >= 24) return 70;
  return 30;
};
