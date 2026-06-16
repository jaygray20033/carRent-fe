import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService.js';
import Loading from '../../components/common/Loading.jsx';

export default function ProfilePage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => userService.me(),
  });

  const user = data?.data?.user;
  const { register, handleSubmit, reset } = useForm({ values: user });

  const mutation = useMutation({
    mutationFn: (payload) => userService.updateMe(payload),
    onSuccess: () => {
      toast.success('Cập nhật thành công');
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (e) => toast.error(e?.message || 'Cập nhật thất bại'),
  });

  if (isLoading) return <Loading />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Hồ sơ của tôi</h1>
      <form
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        className="card mt-6 space-y-4 p-6"
      >
        <div>
          <label className="label">Họ và tên</label>
          <input className="input" {...register('fullName')} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Số điện thoại</label>
            <input className="input bg-gray-50" value={user?.phone || ''} disabled />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" {...register('email')} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">CCCD / Passport</label>
            <input className="input" {...register('nationalId')} />
          </div>
          <div>
            <label className="label">GPLX</label>
            <input className="input" {...register('driverLicense')} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => reset(user)} className="btn-outline">
            Khôi phục
          </button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
