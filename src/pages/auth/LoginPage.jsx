// src/pages/auth/LoginPage.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth.js';
import AuthCard from '../../components/auth/AuthCard.jsx';
import AuthField from '../../components/auth/AuthField.jsx';
import AuthButton from '../../components/auth/AuthButton.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      await login({ identifier: values.identifier.trim(), password: values.password });
      const to = location.state?.from || '/';
      navigate(to, { replace: true });
    } catch (e) {
      if (e?.code === 'ACCOUNT_PENDING') {
        toast('Tài khoản chưa kích hoạt, vui lòng xác thực OTP', { icon: 'ℹ️' });
        navigate('/register', { state: { identifier: values.identifier.trim() } });
      } else {
        toast.error(e?.message || 'Đăng nhập thất bại');
      }
    }
  };

  return (
    <AuthCard
      title="Đăng nhập"
      desc="Sử dụng số điện thoại hoặc email"
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:underline">
            Đăng ký
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthField
          label="Số điện thoại / Email"
          placeholder="0901234567 hoặc you@email.com"
          error={errors.identifier?.message}
          {...register('identifier', { required: 'Thông tin này là bắt buộc' })}
        />
        <AuthField
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', { required: 'Thông tin này là bắt buộc' })}
        />

        <AuthButton type="submit" loading={isSubmitting}>
          Đăng nhập
        </AuthButton>

        <div className="text-center text-sm">
          <Link to="/forgot-password" className="font-medium text-primary-600 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>
      </form>

      <div className="mt-6 rounded-xl bg-ink-50 p-3 text-xs text-ink-400">
        <p className="font-medium text-ink-700">Demo account:</p>
        <p>📱 Admin: 0900000001 / Admin@123</p>
        <p>📱 User: 0901234567 / User@123</p>
      </div>
    </AuthCard>
  );
}
