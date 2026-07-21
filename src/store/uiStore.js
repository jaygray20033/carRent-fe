// src/store/uiStore.js — small UI store for the global auth modal
import { create } from 'zustand';

export const useUiStore = create((set, get) => ({
  authModalOpen: false,
  authModalTab: 'login', // 'login' | 'register'
  onAuthSuccess: null, // optional callback fired once, after a successful login/register

  // Open the modal. Pass an onSuccess callback to resume an action (e.g. submit a
  // partner application) right after the user logs in — the form stays on-page.
  openAuthModal: (tab = 'login', onSuccess = null) =>
    set({ authModalOpen: true, authModalTab: tab, onAuthSuccess: onSuccess }),

  // Close the modal. `result.loggedIn` is true when the user actually authenticated
  // (vs. dismissing) — in that case we fire and clear the pending onSuccess callback.
  closeAuthModal: (result) => {
    const cb = get().onAuthSuccess;
    set({ authModalOpen: false, onAuthSuccess: null });
    if (result?.loggedIn && typeof cb === 'function') cb();
  },
}));

export default useUiStore;
