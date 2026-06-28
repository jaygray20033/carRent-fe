// src/pages/auth/RegisterPage.jsx — Register + OTP step
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore.js';
import { authService } from '../../services/authService.js';
import AuthCard from '../../components/auth/AuthCard.jsx';
import AuthField from '../../components/auth/AuthField.jsx';
import AuthButton from '../../components/auth/AuthButton.jsx';
import OtpInput from '../../components/auth/OtpInput.jsx';

const errMsg = (e, fb) => e?.message || e?.response?.data?.message || fb;

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState('info'); // 'info' | 'otp'
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [creds, setCreds] = useState({ phone: '', password: '' });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  const startCooldown = () => {
    setResendIn(60);
    const t = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const onSubmitInfo = async (values) => {
    try {
      await authService.register({
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        email: values.email?.trim() || undefined,
        password: values.password,
      });
      setCreds({ phone: values.phone.trim(), password: values.password });
      toast.success('Đã gửi mã OTP tới số điện thoại của bạn');
      setStep('otp');
      startCooldown();
    } catch (e) {
      if (e?.code === 'PHONE_EXISTS') {
        setError('phone', { message: 'Số điện thoại đã được đăng ký' });
      } else if (e?.code === 'EMAIL_EXISTS') {
        setError('email', { message: 'Email đã được đăng ký' });
      } else {
        toast.error(errMsg(e, 'Đăng ký thất bại'));
      }
    }
  };

  const onSubmitOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setOtpError('Vui lòng nhập đủ 6 số');
    setOtpError('');
    setVerifying(true);
    try {
      await authService.verifyOtp({ identifier: creds.phone, code: otp, purpose: 'REGISTER' });
      // Auto login after activation
      const res = await authService.login({ identifier: creds.phone, password: creds.password });
      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken, refreshToken);
      toast.success('Đăng ký thành công');
      navigate('/', { replace: true });
    } catch (err) {
      setOtpError(errMsg(err, 'Mã OTP không đúng'));
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (resendIn > 0) return;
    try {
      await authService.resendOtp({ identifier: creds.phone, purpose: 'REGISTER' });
      toast.success('Đã gửi lại mã OTP');
      startCooldown();
    } catch (err) {
      toast.error(errMsg(err, 'Không thể gửi lại OTP'));
    }
  };

  if (step === 'otp') {
    return (
      <AuthCard title="Xác thực OTP" desc={`Mã 6 số đã gửi tới ${creds.phone}`}>
        <form onSubmit={onSubmitOtp} className="space-y-5">
          <OtpInput
            value={otp}
            onChange={(v) => {
              setOtp(v);
              setOtpError('');
            }}
            error={!!otpError}
          />
          {otpError && <p className="-mt-2 text-xs font-medium text-red-500">{otpError}</p>}
          <AuthButton type="submit" loading={verifying} disabled={otp.length !== 6}>
            Xác nhận
          </AuthButton>
          <div className="text-center text-sm text-ink-400">
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
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Đăng ký tài khoản"
      desc="Tạo tài khoản miễn phí trong 1 phút"
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmitInfo)} className="space-y-4">
        <AuthField
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          error={errors.fullName?.message}
          {...register('fullName', { required: 'Thông tin này là bắt buộc' })}
        />
        <AuthField
          label="Số điện thoại"
          placeholder="0901234567"
          error={errors.phone?.message}
          {...register('phone', {
            required: 'Thông tin này là bắt buộc',
            pattern: { value: /^(0|\+84)\d{9,10}$/, message: 'Số điện thoại không hợp lệ' },
          })}
        />
        <AuthField
          label="Email (tuỳ chọn)"
          type="email"
          placeholder="you@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <AuthField
          label="Mật khẩu"
          type="password"
          placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
          error={errors.password?.message}
          {...register('password', {
            required: 'Thông tin này là bắt buộc',
            minLength: { value: 8, message: 'Mật khẩu tối thiểu 8 ký tự' },
            pattern: {
              value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
              message: 'Mật khẩu cần có cả chữ và số',
            },
          })}
        />

        <AuthButton type="submit" loading={isSubmitting}>
          Đăng ký
        </AuthButton>
      </form>
    </AuthCard>
  );
}
