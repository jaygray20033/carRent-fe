// src/hooks/useAuth.js
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';
import { authService } from '../services/authService.js';

export function useAuth() {
  const navigate = useNavigate();
  const { user, accessToken, setAuth, clearAuth } = useAuthStore();

  // UC-02 — login with { identifier, password }
  const login = async (payload) => {
    const res = await authService.login(payload);
    const { user: u, accessToken: at, refreshToken: rt } = res.data;
    setAuth(u, at, rt);
    toast.success('Đăng nhập thành công');
    return u;
  };

  // UC-01 — register. Returns { user, requireOtp } — DOES NOT auto-login
  // (the account is PENDING until OTP is verified).
  const register = async (payload) => {
    const res = await authService.register(payload);
    return res.data; // { user, requireOtp, otpPurpose }
  };

  // UC-03 — verify OTP. On REGISTER success the user becomes ACTIVE.
  const verifyOtp = async (payload) => {
    const res = await authService.verifyOtp(payload);
    return res.data; // { verified, user? }
  };

  const resendOtp = async (payload) => {
    const res = await authService.resendOtp(payload);
    toast.success('Đã gửi lại mã OTP');
    return res.data;
  };

  // UC-04
  const forgotPassword = async (identifier) => {
    const res = await authService.forgotPassword({ identifier });
    return res.data;
  };

  const resetPassword = async (payload) => {
    const res = await authService.resetPassword(payload);
    toast.success('Đặt lại mật khẩu thành công');
    return res.data;
  };

  const logout = async () => {
    const rt = useAuthStore.getState().refreshToken;
    try {
      await authService.logout(rt);
    } catch {
      // ignore network errors on logout
    }
    clearAuth();
    toast.success('Đã đăng xuất');
    navigate('/');
  };

  return {
    user,
    isAuthenticated: !!accessToken,
    login,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    logout,
  };
}

export default useAuth;
