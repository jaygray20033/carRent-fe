// src/services/postService.js
import api from './api.js';

export const postService = {
  list: (params) => api.get('/posts', { params }),
};
