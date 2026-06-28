// src/services/authService.js — Auth API calls (UC-01..04)
// NOTE: api.js response interceptor already unwraps `{ success, data, ... }`
// so each call resolves to the raw envelope `{ success, message, data }`.
import api from './api.js';

export const authService = {
  // UC-01 — Register (returns user + requireOtp)
  register: (payload) => api.post('/auth/register', payload),

  // UC-02 — Login with identifier (phone|email) + password
  login: (payload) => api.post('/auth/login', payload),

  // UC-03 — Verify OTP. purpose: 'REGISTER' | 'RESET' | 'CHANGE_PHONE'
  verifyOtp: (payload) => api.post('/auth/verify-otp', payload),

  // Resend OTP (rate limited 60s on the server)
  resendOtp: (payload) => api.post('/auth/resend-otp', payload),

  // UC-04 — Forgot password (always 200 — anti-enumeration)
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),

  // UC-04 — Reset password { identifier, code, newPassword }
  resetPassword: (payload) => api.post('/auth/reset-password', payload),

  // Token lifecycle — issue a fresh access/refresh pair
  refresh: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),

  // Logout — revoke current refresh token server-side
  logout: (refreshToken) => api.post('/auth/logout', refreshToken ? { refreshToken } : {}),

  // Current authenticated user
  me: () => api.get('/auth/me'),
};

export default authService;
