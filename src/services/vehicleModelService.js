// src/services/vehicleModelService.js
import api from './api.js';

export const vehicleModelService = {
  list: (params) => api.get('/vehicle-models', { params }),
};
