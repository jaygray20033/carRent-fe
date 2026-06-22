// src/utils/booking.js — Date validation for UC-08
import dayjs from 'dayjs';

/**
 * Validate booking date range.
 * Rules:
 *  - pickup_at >= now + 1 hour
 *  - return_at > pickup_at
 *  - duration >= 4 hours
 *  - duration <= 90 days
 *
 * @param {string|Date} pickupAt
 * @param {string|Date} returnAt
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateBookingDates(pickupAt, returnAt) {
  const errors = [];
  const now = dayjs();
  const pickup = dayjs(pickupAt);
  const ret = dayjs(returnAt);

  if (!pickup.isValid()) {
    errors.push('Ngày nhận xe không hợp lệ.');
    return { valid: false, errors };
  }
  if (!ret.isValid()) {
    errors.push('Ngày trả xe không hợp lệ.');
    return { valid: false, errors };
  }

  // pickup_at >= now + 1h
  const minPickup = now.add(1, 'hour');
  if (pickup.isBefore(minPickup)) {
    errors.push('Ngày nhận xe phải cách hiện tại ít nhất 1 giờ.');
  }

  // return_at > pickup_at
  if (!ret.isAfter(pickup)) {
    errors.push('Ngày trả xe phải sau ngày nhận xe.');
  }

  // duration >= 4 hours
  const diffHours = ret.diff(pickup, 'hour', true);
  if (diffHours < 4) {
    errors.push('Thời gian thuê tối thiểu là 4 giờ.');
  }

  // duration <= 90 days
  const diffDays = ret.diff(pickup, 'day', true);
  if (diffDays > 90) {
    errors.push('Thời gian thuê tối đa là 90 ngày.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Check if a date falls within any booked range.
 * @param {Date} date
 * @param {Array<{from: string, to: string}>} bookedRanges
 * @returns {boolean}
 */
export function isDateBooked(date, bookedRanges = []) {
  const d = dayjs(date).startOf('day');
  return bookedRanges.some((r) => {
    const from = dayjs(r.from).startOf('day');
    const to = dayjs(r.to).startOf('day');
    return (d.isSame(from) || d.isAfter(from)) && (d.isSame(to) || d.isBefore(to));
  });
}

/**
 * Calculate rental days (minimum 1).
 * @param {string|Date} pickupAt
 * @param {string|Date} returnAt
 * @returns {number}
 */
export function calcRentalDays(pickupAt, returnAt) {
  const diff = dayjs(returnAt).diff(dayjs(pickupAt), 'day', true);
  return Math.max(1, Math.ceil(diff));
}

/**
 * Get minimum pickup datetime (now + 1 hour, rounded up to next 30 min).
 */
export function getMinPickupDate() {
  const min = dayjs().add(1, 'hour');
  const minutes = min.minute();
  if (minutes <= 30) return min.minute(30).second(0);
  return min.add(1, 'hour').minute(0).second(0);
}

/**
 * Get default return date (pickup + 1 day).
 */
export function getDefaultReturnDate(pickupAt) {
  return dayjs(pickupAt).add(1, 'day');
}
