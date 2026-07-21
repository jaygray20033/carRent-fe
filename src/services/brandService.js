// src/services/brandService.js
import api from './api.js';

export const brandService = {
  list: () => api.get('/brands'),
};
