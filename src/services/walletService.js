// src/services/walletService.js — Wallet API (UC-44, UC-45, UC-46).
// The api.js response interceptor unwraps `{ success, data, ... }`.
import api from './api.js';

export const walletService = {
  // UC-44 — balance + wallet info
  getWallet: () => api.get('/me/wallet'),

  // UC-45 — transaction history { type?, page?, limit? }
  listTransactions: (params) => api.get('/me/wallet/transactions', { params }),

  // UC-46 — topup { amount, method } → { payment, checkoutUrl }
  topup: (payload) => api.post('/me/wallet/topup', payload),
};

export default walletService;
