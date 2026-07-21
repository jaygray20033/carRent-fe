// src/services/userService.js — User account API (UC-37 → UC-41).
// The api.js response interceptor unwraps `{ success, data, ... }`.
import api from './api.js';

export const userService = {
  // UC-37 — current profile
  me: () => api.get('/me'),

  // UC-38 — update profile (partial)
  updateMe: (payload) => api.patch('/me', payload),

  // UC-39 — avatar upload (multipart field "image")
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // UC-40 — change password { oldPassword, newPassword } (revokes all sessions)
  changePassword: (payload) => api.post('/me/change-password', payload),

  // UC-41 — change phone step 1: request OTP to the new number { newPhone }
  requestPhoneChange: (payload) => api.post('/me/change-phone', payload),

  // UC-41 — change phone step 2: verify OTP { code }
  verifyPhoneChange: (payload) => api.post('/me/change-phone/verify', payload),
};

export default userService;
