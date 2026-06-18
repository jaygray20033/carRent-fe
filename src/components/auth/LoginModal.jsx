// src/components/auth/LoginModal.jsx
//
// Auth modal overlay (theo Figma) — KHÔNG redirect khi mở từ Header.
// Multi-step flow:
//   Tab LOGIN:
//     login-phone     → nhập SĐT/email
//     login-password  → nhập mật khẩu  (Step 3)
//   Tab REGISTER:
//     reg-info        → nhập SĐT + họ tên + mật khẩu (Step 1/4)
//     reg-otp         → nhập OTP 6 ô   (Step 2)
//   Forgot sub-flow:
//     forgot-id       → nhập SĐT/email
//     forgot-otp      → nhập OTP 6 ô
//     forgot-reset    → tạo mật khẩu mới
//
import { useEffect, useState } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore.js';
import { authService } from '../../services/authService.js';
import AuthLogo from './AuthLogo.jsx';
import AuthField from './AuthField.jsx';
import AuthButton from './AuthButton.jsx';
import OtpInput from './OtpInput.jsx';

const REQUIRED_MSG = 'Thông tin này là bắt buộc';
const phoneRe = /^(0|\+84)\d{9,10}$/;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isIdentifier = (v) => phoneRe.test(v) || emailRe.test(v);

const errMsg = (e, fallback) =>
  e?.message || e?.response?.data?.message || fallback;

export default function LoginModal({ open, onClose, initialTab = 'login' }) {
  const setAuth = useAuthStore((s) => s.setAuth);

  const [tab, setTab] = useState(initialTab); // 'login' | 'register'
  const [step, setStep] = useState('login-phone');
  const [loading, setLoading] = useState(false);

  // shared form state
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [resendIn, setResendIn] = useState(0);

  // reset everything whenever the modal (re)opens
  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setStep(initialTab === 'register' ? 'reg-info' : 'login-phone');
      setIdentifier('');
      setFullName('');
      setPassword('');
      setNewPassword('');
      setOtp('');
      setErrors({});
      setResendIn(0);
    }
  }, [open, initialTab]);

  // resend cooldown ticker
  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  if (!open) return null;

  const setErr = (field, msg) => setErrors((p) => ({ ...p, [field]: msg }));
  const clearErr = (field) => setErrors((p) => ({ ...p, [field]: undefined }));

  const finishAuth = (data) => {
    const { user, accessToken, refreshToken } = data;
    setAuth(user, accessToken, refreshToken);
    toast.success('Đăng nhập thành công');
    onClose?.({ loggedIn: true });
  };

  const switchTab = (next) => {
    setErrors({});
    setOtp('');
    setPassword('');
    setNewPassword('');
    setTab(next);
    setStep(next === 'register' ? 'reg-info' : 'login-phone');
  };

  // ----------------------------------------------------------------- LOGIN
  const submitLoginPhone = (e) => {
    e.preventDefault();
    if (!identifier.trim()) return setErr('identifier', REQUIRED_MSG);
    if (!isIdentifier(identifier.trim()))
      return setErr('identifier', 'Số điện thoại hoặc email không hợp lệ');
    clearErr('identifier');
    setStep('login-password'); // Step 3 — nhập mật khẩu
  };

  const submitLoginPassword = async (e) => {
    e.preventDefault();
    if (!password) return setErr('password', REQUIRED_MSG);
    clearErr('password');
    setLoading(true);
    try {
      const res = await authService.login({ identifier: identifier.trim(), password });
      finishAuth(res.data);
    } catch (err) {
      if (err?.code === 'ACCOUNT_PENDING') {
        // chưa verify OTP → chuyển sang bước OTP để kích hoạt
        toast('Tài khoản chưa kích hoạt, vui lòng xác thực OTP', { icon: 'ℹ️' });
        try {
          await authService.resendOtp({ identifier: identifier.trim(), purpose: 'REGISTER' });
        } catch {
          /* ignore */
        }
        setOtp('');
        setResendIn(60);
        setStep('reg-otp');
      } else {
        setErr('password', errMsg(err, 'Đăng nhập thất bại'));
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------- REGISTER
  const submitRegisterInfo = async (e) => {
    e.preventDefault();
    const next = {};
    if (!fullName.trim()) next.fullName = REQUIRED_MSG;
    if (!identifier.trim()) next.identifier = REQUIRED_MSG;
    else if (!phoneRe.test(identifier.trim())) next.identifier = 'Số điện thoại không hợp lệ';
    if (!password) next.password = REQUIRED_MSG;
    else if (password.length < 8) next.password = 'Mật khẩu tối thiểu 8 ký tự';
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    try {
      await authService.register({
        fullName: fullName.trim(),
        phone: identifier.trim(),
        password,
      });
      toast.success('Đã gửi mã OTP tới số điện thoại của bạn');
      setOtp('');
      setResendIn(60);
      setStep('reg-otp'); // Step 2 — nhập OTP
    } catch (err) {
      const msg = errMsg(err, 'Đăng ký thất bại');
      if (err?.code === 'PHONE_EXISTS') setErr('identifier', 'Số điện thoại đã được đăng ký');
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitRegisterOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setErr('otp', 'Vui lòng nhập đủ 6 số');
    clearErr('otp');
    setLoading(true);
    try {
      await authService.verifyOtp({
        identifier: identifier.trim(),
        code: otp,
        purpose: 'REGISTER',
      });
      // Step 4 — hoàn tất: tự đăng nhập luôn bằng mật khẩu vừa tạo
      const res = await authService.login({ identifier: identifier.trim(), password });
      toast.success('Tạo tài khoản thành công');
      finishAuth(res.data);
    } catch (err) {
      setErr('otp', errMsg(err, 'Mã OTP không đúng'));
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------- FORGOT
  const submitForgotId = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return setErr('identifier', REQUIRED_MSG);
    if (!isIdentifier(identifier.trim()))
      return setErr('identifier', 'Số điện thoại hoặc email không hợp lệ');
    clearErr('identifier');
    setLoading(true);
    try {
      await authService.forgotPassword({ identifier: identifier.trim() });
      toast.success('Nếu tài khoản tồn tại, mã OTP đã được gửi');
      setOtp('');
      setResendIn(60);
      setStep('forgot-otp');
    } catch (err) {
      toast.error(errMsg(err, 'Có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  const submitForgotOtp = (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setErr('otp', 'Vui lòng nhập đủ 6 số');
    clearErr('otp');
    setStep('forgot-reset');
  };

  const submitForgotReset = async (e) => {
    e.preventDefault();
    if (!newPassword) return setErr('newPassword', REQUIRED_MSG);
    if (newPassword.length < 8) return setErr('newPassword', 'Mật khẩu tối thiểu 8 ký tự');
    clearErr('newPassword');
    setLoading(true);
    try {
      await authService.resetPassword({
        identifier: identifier.trim(),
        code: otp,
        newPassword,
      });
      toast.success('Đặt lại mật khẩu thành công, vui lòng đăng nhập');
      setPassword('');
      setOtp('');
      setStep('login-password');
    } catch (err) {
      if (err?.code === 'OTP_INVALID' || err?.code === 'OTP_EXPIRED') {
        setOtp('');
        setStep('forgot-otp');
        setErr('otp', errMsg(err, 'Mã OTP không đúng hoặc đã hết hạn'));
      } else {
        setErr('newPassword', errMsg(err, 'Đặt lại mật khẩu thất bại'));
      }
    } finally {
      setLoading(false);
    }
  };

  const resend = async (purpose) => {
    if (resendIn > 0) return;
    try {
      if (purpose === 'RESET') {
        await authService.forgotPassword({ identifier: identifier.trim() });
      } else {
        await authService.resendOtp({ identifier: identifier.trim(), purpose });
      }
      toast.success('Đã gửi lại mã OTP');
      setResendIn(60);
    } catch (err) {
      toast.error(errMsg(err, 'Không thể gửi lại OTP'));
    }
  };

  // --------------------------------------------------------------- RENDER
  const titles = {
    'login-phone': { title: 'Đăng nhập', desc: 'Nhập số điện thoại hoặc email để tiếp tục' },
    'login-password': { title: 'Nhập mật khẩu', desc: `Đăng nhập với ${identifier}` },
    'reg-info': { title: 'Tạo tài khoản', desc: 'Nhập thông tin để bắt đầu' },
    'reg-otp': { title: 'Xác thực OTP', desc: `Mã 6 số đã gửi tới ${identifier}` },
    'forgot-id': { title: 'Quên mật khẩu', desc: 'Nhập SĐT/email để nhận mã đặt lại' },
    'forgot-otp': { title: 'Xác thực OTP', desc: `Mã 6 số đã gửi tới ${identifier}` },
    'forgot-reset': { title: 'Đặt mật khẩu mới', desc: 'Tạo mật khẩu mới cho tài khoản' },
  };
  const head = titles[step] || titles['login-phone'];

  const showBack = step !== 'login-phone' && step !== 'reg-info';
  const goBack = () => {
    setErrors({});
    if (step === 'login-password') setStep('login-phone');
    else if (step === 'reg-otp') setStep('reg-info');
    else if (step === 'forgot-id') setStep('login-phone');
    else if (step === 'forgot-otp') setStep('forgot-id');
    else if (step === 'forgot-reset') setStep('forgot-otp');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        {/* top bar */}
        <div className="flex items-center justify-between">
          {showBack ? (
            <button
              onClick={goBack}
              className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-50 hover:text-ink-700"
              aria-label="Quay lại"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <span className="h-8 w-8" />
          )}
          <button
            onClick={() => onClose?.()}
            className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-50 hover:text-ink-700"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* logo */}
        <div className="mt-1">
          <AuthLogo />
        </div>

        {/* heading */}
        <div className="mt-5 text-center">
          <h2 className="text-2xl font-bold text-ink-900">{head.title}</h2>
          <p className="mt-1 text-sm text-ink-300">{head.desc}</p>
        </div>

        {/* body */}
        <div className="mt-6">
          {/* ----- Step 1 (login): phone ----- */}
          {step === 'login-phone' && (
            <form onSubmit={submitLoginPhone} className="space-y-4">
              <AuthField
                label="Số điện thoại / Email"
                placeholder="0901234567 hoặc you@email.com"
                value={identifier}
                error={errors.identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  clearErr('identifier');
                }}
                autoFocus
              />
              <AuthButton type="submit" disabled={!identifier.trim()}>
                Tiếp tục
              </AuthButton>
              <div className="text-center text-sm text-ink-400">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('register')}
                  className="font-semibold text-primary-600 hover:underline"
                >
                  Đăng ký
                </button>
              </div>
            </form>
          )}

          {/* ----- Step 3 (login): password ----- */}
          {step === 'login-password' && (
            <form onSubmit={submitLoginPassword} className="space-y-4">
              <AuthField
                label="Mật khẩu"
                type="password"
                placeholder="••••••••"
                value={password}
                error={errors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearErr('password');
                }}
                autoFocus
              />
              <AuthButton type="submit" loading={loading} disabled={!password}>
                Đăng nhập
              </AuthButton>
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setErrors({});
                    setStep('forgot-id');
                  }}
                  className="font-medium text-primary-600 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
            </form>
          )}

          {/* ----- Step 1/4 (register): info ----- */}
          {step === 'reg-info' && (
            <form onSubmit={submitRegisterInfo} className="space-y-4">
              <AuthField
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
                value={fullName}
                error={errors.fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearErr('fullName');
                }}
                autoFocus
              />
              <AuthField
                label="Số điện thoại"
                placeholder="0901234567"
                value={identifier}
                error={errors.identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  clearErr('identifier');
                }}
              />
              <AuthField
                label="Mật khẩu"
                type="password"
                placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
                value={password}
                error={errors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearErr('password');
                }}
              />
              <AuthButton
                type="submit"
                loading={loading}
                disabled={!fullName.trim() || !identifier.trim() || !password}
              >
                Tiếp tục
              </AuthButton>
              <div className="text-center text-sm text-ink-400">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="font-semibold text-primary-600 hover:underline"
                >
                  Đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* ----- Step 2 (register): OTP ----- */}
          {step === 'reg-otp' && (
            <form onSubmit={submitRegisterOtp} className="space-y-5">
              <OtpInput value={otp} onChange={(v) => { setOtp(v); clearErr('otp'); }} error={!!errors.otp} />
              {errors.otp && <p className="-mt-2 text-xs font-medium text-red-500">{errors.otp}</p>}
              <AuthButton type="submit" loading={loading} disabled={otp.length !== 6}>
                Xác nhận
              </AuthButton>
              <div className="text-center text-sm text-ink-400">
                {resendIn > 0 ? (
                  <span>Gửi lại mã sau {resendIn}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => resend('REGISTER')}
                    className="font-medium text-primary-600 hover:underline"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ----- Forgot: identifier ----- */}
          {step === 'forgot-id' && (
            <form onSubmit={submitForgotId} className="space-y-4">
              <AuthField
                label="Số điện thoại / Email"
                placeholder="0901234567 hoặc you@email.com"
                value={identifier}
                error={errors.identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  clearErr('identifier');
                }}
                autoFocus
              />
              <AuthButton type="submit" loading={loading} disabled={!identifier.trim()}>
                Gửi mã xác thực
              </AuthButton>
            </form>
          )}

          {/* ----- Forgot: OTP ----- */}
          {step === 'forgot-otp' && (
            <form onSubmit={submitForgotOtp} className="space-y-5">
              <OtpInput value={otp} onChange={(v) => { setOtp(v); clearErr('otp'); }} error={!!errors.otp} />
              {errors.otp && <p className="-mt-2 text-xs font-medium text-red-500">{errors.otp}</p>}
              <AuthButton type="submit" disabled={otp.length !== 6}>
                Tiếp tục
              </AuthButton>
              <div className="text-center text-sm text-ink-400">
                {resendIn > 0 ? (
                  <span>Gửi lại mã sau {resendIn}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => resend('RESET')}
                    className="font-medium text-primary-600 hover:underline"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ----- Forgot: new password ----- */}
          {step === 'forgot-reset' && (
            <form onSubmit={submitForgotReset} className="space-y-4">
              <AuthField
                label="Mật khẩu mới"
                type="password"
                placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
                value={newPassword}
                error={errors.newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  clearErr('newPassword');
                }}
                autoFocus
              />
              <AuthButton type="submit" loading={loading} disabled={!newPassword}>
                Đặt lại mật khẩu
              </AuthButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
