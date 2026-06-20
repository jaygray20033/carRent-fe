// src/services/categoryService.js
import api from './api.js';

export const categoryService = {
  list: () => api.get('/categories'),
};
