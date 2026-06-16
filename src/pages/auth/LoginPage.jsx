import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    try {
      await login(values);
      const to = location.state?.from || '/';
      navigate(to, { replace: true });
    } catch (e) {
      toast.error(e?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
        <p className="mt-1 text-sm text-gray-500">Sử dụng số điện thoại hoặc email</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="label">Số điện thoại / Email</label>
            <input
              className="input"
              placeholder="0901234567 hoặc you@email.com"
              {...register('identifier', { required: 'Vui lòng nhập' })}
            />
            {errors.identifier && (
              <p className="mt-1 text-xs text-red-500">{errors.identifier.message}</p>
            )}
          </div>

          <div>
            <label className="label">Mật khẩu</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'Vui lòng nhập' })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:underline">
            Đăng ký
          </Link>
        </div>

        <div className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
          <p className="font-medium text-gray-700">Demo account:</p>
          <p>📱 Admin: 0900000001 / Admin@1234</p>
          <p>📱 User: 0901234567 / User@1234</p>
        </div>
      </div>
    </div>
  );
}
