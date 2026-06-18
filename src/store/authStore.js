// src/store/authStore.js — Zustand auth store
//
// Security: the refresh token is kept in MEMORY ONLY. It is intentionally
// excluded from `partialize`, so it is never written to localStorage.
// (In a full http-only-cookie setup the refresh token would live in a cookie
// and not in JS at all; here we keep it in memory as the next best option.)
//
// Persisted to localStorage: `user` + `accessToken` only.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null, // memory only — NOT persisted

      // Set full session after login/register/verify
      setAuth: (user, accessToken, refreshToken) =>
        set({
          user: user ?? get().user,
          accessToken: accessToken ?? get().accessToken,
          refreshToken: refreshToken ?? get().refreshToken,
        }),

      // Backwards-compatible alias
      setSession: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      // Update only the tokens (used after silent refresh/rotation)
      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken: accessToken ?? get().accessToken,
          refreshToken: refreshToken ?? get().refreshToken,
        }),

      setUser: (user) => set({ user }),

      // Clear everything (logout / refresh failure)
      clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),

      // Backwards-compatible alias
      clear: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'carrent-auth',
      // ⚠️ refreshToken deliberately omitted — never persist it.
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
      }),
    }
  )
);

export const isAuthenticated = () => !!useAuthStore.getState().accessToken;

export default useAuthStore;
