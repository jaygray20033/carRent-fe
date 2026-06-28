// src/store/uiStore.js — small UI store for the global auth modal
import { create } from 'zustand';

export const useUiStore = create((set) => ({
  authModalOpen: false,
  authModalTab: 'login', // 'login' | 'register'

  openAuthModal: (tab = 'login') => set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),
}));

export default useUiStore;
