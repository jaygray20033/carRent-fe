// src/services/stationService.js
import api from './api.js';

export const stationService = {
  list: (params) => api.get('/stations', { params }),
  detail: (id) => api.get(`/stations/${id}`),
};
