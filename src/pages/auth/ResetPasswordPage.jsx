// src/pages/auth/ResetPasswordPage.jsx
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService.js';
import AuthCard from '../../components/auth/AuthCard.jsx';
import AuthField from '../../components/auth/AuthField.jsx';
import AuthButton from '../../components/auth/AuthButton.jsx';
import OtpInput from '../../components/auth/OtpInput.jsx';

const errMsg = (e, fb) => e?.message || e?.response?.data?.message || fb;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromIdentifier = location.state?.identifier || '';

  const [identifier, setIdentifier] = useState(fromIdentifier);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(fromIdentifier ? 60 : 0);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const setErr = (k, v) => setErrors((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!identifier.trim()) next.identifier = 'Thông tin này là bắt buộc';
    if (otp.length !== 6) next.otp = 'Vui lòng nhập đủ 6 số';
    if (!newPassword) next.newPassword = 'Thông tin này là bắt buộc';
    else if (newPassword.length < 8) next.newPassword = 'Mật khẩu tối thiểu 8 ký tự';
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    try {
      await authService.resetPassword({ identifier: identifier.trim(), code: otp, newPassword });
      toast.success('Đặt lại mật khẩu thành công, vui lòng đăng nhập');
      navigate('/login', { replace: true });
    } catch (err) {
      if (err?.code === 'OTP_INVALID' || err?.code === 'OTP_EXPIRED') {
        setErr('otp', errMsg(err, 'Mã OTP không đúng hoặc đã hết hạn'));
      } else {
        toast.error(errMsg(err, 'Đặt lại mật khẩu thất bại'));
      }
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (resendIn > 0 || !identifier.trim()) return;
    try {
      await authService.forgotPassword({ identifier: identifier.trim() });
      toast.success('Đã gửi lại mã OTP');
      setResendIn(60);
    } catch (err) {
      toast.error(errMsg(err, 'Không thể gửi lại OTP'));
    }
  };

  return (
    <AuthCard
      title="Đặt lại mật khẩu"
      desc="Nhập mã OTP và mật khẩu mới"
      footer={
        <Link to="/login" className="font-semibold text-primary-600 hover:underline">
          Quay lại đăng nhập
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {!fromIdentifier && (
          <AuthField
            label="Số điện thoại / Email"
            placeholder="0901234567 hoặc you@email.com"
            value={identifier}
            error={errors.identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              setErr('identifier', undefined);
            }}
          />
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Mã OTP</label>
          <OtpInput
            value={otp}
            onChange={(v) => {
              setOtp(v);
              setErr('otp', undefined);
            }}
            error={!!errors.otp}
            autoFocus={!!fromIdentifier}
          />
          {errors.otp && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.otp}</p>}
          <div className="mt-2 text-right text-xs text-ink-400">
            {resendIn > 0 ? (
              <span>Gửi lại mã sau {resendIn}s</span>
            ) : (
              <button
                type="button"
                onClick={resend}
                className="font-medium text-primary-600 hover:underline"
              >
                Gửi lại mã OTP
              </button>
            )}
          </div>
        </div>

        <AuthField
          label="Mật khẩu mới"
          type="password"
          placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
          value={newPassword}
          error={errors.newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setErr('newPassword', undefined);
          }}
        />

        <AuthButton type="submit" loading={loading}>
          Đặt lại mật khẩu
        </AuthButton>
      </form>
    </AuthCard>
  );
}
