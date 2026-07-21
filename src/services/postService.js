// src/services/postService.js
import api from './api.js';

export const postService = {
  // UC-21 — paginated list, filter by category/tag/q
  list: (params) => api.get('/posts', { params }),
  // UC-21 — post categories with published counts (for the list filter)
  categories: () => api.get('/posts/categories'),
  // UC-21 — featured posts
  featured: (limit = 3) => api.get('/posts/featured', { params: { limit } }),
  // UC-27 — fulltext search
  search: (params) => api.get('/posts/search', { params }),
  // UC-22/25 — detail by slug (+author +category +tags, view++)
  detail: (slug) => api.get(`/posts/${slug}`),
  // UC-26 — related posts by id
  related: (id) => api.get(`/posts/${id}/related`),

  // UC-24 — comments
  comments: (id, params) => api.get(`/posts/${id}/comments`, { params }),
  myComments: (id) => api.get(`/posts/${id}/comments/mine`),
  addComment: (id, content) => api.post(`/posts/${id}/comments`, { content }),
};

export default postService;
