// src/pages/auth/ForgotPasswordPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService.js';
import AuthCard from '../../components/auth/AuthCard.jsx';
import AuthField from '../../components/auth/AuthField.jsx';
import AuthButton from '../../components/auth/AuthButton.jsx';

const idRe = /^((0|\+84)\d{9,10}|[^\s@]+@[^\s@]+\.[^\s@]+)$/;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    const identifier = values.identifier.trim();
    try {
      // Always 200 (anti-enumeration) — proceed to reset step regardless.
      await authService.forgotPassword({ identifier });
      toast.success('Nếu tài khoản tồn tại, mã OTP đã được gửi');
      navigate('/reset-password', { state: { identifier } });
    } catch (e) {
      toast.error(e?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <AuthCard
      title="Quên mật khẩu"
      desc="Nhập số điện thoại hoặc email để nhận mã đặt lại"
      footer={
        <>
          Nhớ mật khẩu rồi?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthField
          label="Số điện thoại / Email"
          placeholder="0901234567 hoặc you@email.com"
          error={errors.identifier?.message}
          {...register('identifier', {
            required: 'Thông tin này là bắt buộc',
            pattern: { value: idRe, message: 'Số điện thoại hoặc email không hợp lệ' },
          })}
        />
        <AuthButton type="submit" loading={isSubmitting}>
          Gửi mã xác thực
        </AuthButton>
      </form>
    </AuthCard>
  );
}
