// src/services/api.js — Axios client + interceptors
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL,
  timeout: 20000,
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — auto refresh on 401 (once), then redirect
let isRefreshing = false;
let refreshQueue = [];

api.interceptors.response.use(
  (res) => res.data, // unwrap { success, data, ... }
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const payload = error.response?.data;

    if (status === 401 && !original._retry) {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().clear();
        return Promise.reject(payload || error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject, original });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const resp = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = resp.data.data;
        useAuthStore.getState().setTokens(accessToken, newRefresh);

        refreshQueue.forEach(({ resolve, original: cfg }) => {
          cfg.headers.Authorization = `Bearer ${accessToken}`;
          resolve(api(cfg));
        });
        refreshQueue = [];

        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (e) {
        refreshQueue.forEach(({ reject }) => reject(e));
        refreshQueue = [];
        useAuthStore.getState().clear();
        toast.error('Phiên đăng nhập đã hết hạn');
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    const message = payload?.message || error.message || 'Có lỗi xảy ra';
    if (status && status >= 500) toast.error(message);
    return Promise.reject(payload || error);
  }
);

export default api;
