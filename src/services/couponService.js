// src/services/couponService.js — UC-16 coupon validation
import api from './api.js';

export const couponService = {
  // POST /coupons/validate { code, bookingId }
  //   → { success, data: { valid, discount, message, coupon: {id, code, type, value} } }
  validate: (code, bookingId) => api.post('/coupons/validate', { code, bookingId }),
};

export default couponService;
