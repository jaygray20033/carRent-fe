// src/services/insuranceService.js — UC-15 insurance plans
import api from './api.js';

export const insuranceService = {
  // GET /insurance-plans → { status, message, data: [ {id, code, name, description, ratePercent} ] }
  list: () => api.get('/insurance-plans'),
};

export default insuranceService;
