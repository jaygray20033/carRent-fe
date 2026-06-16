// src/hooks/useAuth.js
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';
import { authService } from '../services/authService.js';

export function useAuth() {
  const navigate = useNavigate();
  const { user, accessToken, setSession, clear } = useAuthStore();

  const login = async (payload) => {
    const res = await authService.login(payload);
    const { user, accessToken, refreshToken } = res.data;
    setSession(user, accessToken, refreshToken);
    toast.success(`Chào ${user.fullName}!`);
    return user;
  };

  const register = async (payload) => {
    const res = await authService.register(payload);
    const { user, accessToken, refreshToken } = res.data;
    setSession(user, accessToken, refreshToken);
    toast.success('Đăng ký thành công!');
    return user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    clear();
    toast.success('Đã đăng xuất');
    navigate('/login');
  };

  return {
    user,
    isAuthenticated: !!accessToken,
    login,
    register,
    logout,
  };
}
