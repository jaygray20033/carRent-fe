// src/components/auth/AuthModalHost.jsx
// Mounts the global LoginModal driven by uiStore. Mount once near the app root.
import { useUiStore } from '../../store/uiStore.js';
import LoginModal from './LoginModal.jsx';

export default function AuthModalHost() {
  const { authModalOpen, authModalTab, closeAuthModal } = useUiStore();

  return (
    <LoginModal open={authModalOpen} initialTab={authModalTab} onClose={() => closeAuthModal()} />
  );
}
