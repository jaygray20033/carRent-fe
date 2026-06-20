// src/services/api.js — Axios client + interceptors
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';

const baseURL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL,
  timeout: 20000,
  withCredentials: true, // allow http-only refresh cookie if backend sets one
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

const onLoggedOut = () => {
  useAuthStore.getState().clearAuth();
  // Avoid a redirect loop if already on an auth route
  if (
    typeof window !== 'undefined' &&
    !/\/login|\/reset-password|\/forgot-password/.test(window.location.pathname)
  ) {
    window.location.href = '/login';
  }
};

api.interceptors.response.use(
  (res) => res.data, // unwrap { success, data, ... }
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const payload = error.response?.data;

    // Never try to refresh on the auth endpoints themselves
    const isAuthEndpoint =
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/refresh-token') ||
      original?.url?.includes('/auth/register');

    if (status === 401 && !original._retry && !isAuthEndpoint) {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        onLoggedOut();
        return Promise.reject(payload || error);
      }

      if (isRefreshing) {
        // Queue request until the in-flight refresh resolves
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject, original });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // Use a bare axios call so the interceptors don't recurse
        const resp = await axios.post(
          `${baseURL}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );
        const { accessToken, refreshToken: newRefresh } = resp.data.data;
        useAuthStore.getState().setTokens(accessToken, newRefresh);

        // Flush queued requests with the new token
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
        toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        onLoggedOut();
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
