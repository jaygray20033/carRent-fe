import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: signUp } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    try {
      await signUp(values);
      navigate('/', { replace: true });
    } catch (e) {
      toast.error(e?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h1>
        <p className="mt-1 text-sm text-gray-500">Tạo tài khoản miễn phí trong 1 phút</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="label">Họ và tên</label>
            <input className="input" {...register('fullName', { required: 'Bắt buộc' })} />
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="label">Số điện thoại</label>
            <input
              className="input"
              placeholder="0901234567"
              {...register('phone', {
                required: 'Bắt buộc',
                pattern: { value: /^(0|\+84)\d{9,10}$/, message: 'Số điện thoại không hợp lệ' },
              })}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="label">Email (tuỳ chọn)</label>
            <input className="input" type="email" {...register('email')} />
          </div>
          <div>
            <label className="label">Mật khẩu</label>
            <input
              className="input"
              type="password"
              {...register('password', {
                required: 'Bắt buộc',
                minLength: { value: 8, message: 'Tối thiểu 8 ký tự' },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
                  message: 'Cần chữ hoa, chữ thường, số',
                },
              })}
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
