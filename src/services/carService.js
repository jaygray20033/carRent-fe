// src/services/carService.js
import api from './api.js';

export const carService = {
  // UC-10 + UC-11 — list with filters + sort + pagination
  list: (params) => api.get('/cars', { params }),
  // UC-search — auto-complete suggestions (models + brands + vehicles)
  search: (q, limit = 8) => api.get('/cars/search', { params: { q, limit } }),
  detail: (id) => api.get(`/cars/${id}`),
};
