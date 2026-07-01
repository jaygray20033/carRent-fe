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

export default {
  posts: adminPostService,
  categories: adminCategoryService,
  tags: adminTagService,
  comments: adminCommentService,
  coupons: adminCouponService,
};
