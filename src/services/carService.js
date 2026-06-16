// src/services/carService.js
import api from './api.js';

export const carService = {
  list: (params) => api.get('/cars', { params }),
  detail: (id) => api.get(`/cars/${id}`),
};
