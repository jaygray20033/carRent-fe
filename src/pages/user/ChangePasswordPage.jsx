// src/pages/user/ChangePasswordPage.jsx
// UC-40 — change password. Verifies the current password server-side, then
// bcrypt-updates and revokes all sessions (the current one keeps its in-memory
// access token, so we redirect back to the profile on success).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

const emptyForm = { oldPassword: '', newPassword: '', confirm: '' };

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const mutation = useMutation({
    mutationFn: (payload) => userService.changePassword(payload),
    onSuccess: () => {
      toast.success('Đã đổi mật khẩu. Các thiết bị khác cần đăng nhập lại.');
      navigate('/me');
    },
    onError: (err) => {
      if (err?.code === 'PASSWORD_MISMATCH') {
        setErrors({ oldPassword: 'Mật khẩu hiện tại không đúng' });
      } else if (err?.code === 'PASSWORD_SAME') {
        setErrors({ newPassword: 'Mật khẩu mới phải khác mật khẩu cũ' });
      }
      toast.error(err?.message || 'Không thể đổi mật khẩu');
    },
  });

  const validate = () => {
    const next = {};
    if (!form.oldPassword) next.oldPassword = 'Nhập mật khẩu hiện tại';
    if (form.newPassword.length < 8) next.newPassword = 'Mật khẩu tối thiểu 8 ký tự';
    else if (!/[A-Za-z]/.test(form.newPassword) || !/\d/.test(form.newPassword))
      next.newPassword = 'Mật khẩu phải gồm cả chữ và số';
    if (form.confirm !== form.newPassword) next.confirm = 'Xác nhận mật khẩu không khớp';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({ oldPassword: form.oldPassword, newPassword: form.newPassword });
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 md:p-8">
      <div className="mb-6 flex items-center gap-3 border-b border-ink-100 pb-5">
        <button
          type="button"
          onClick={() => navigate('/me')}
          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50"
          title="Quay lại"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-ink-900">Đổi mật khẩu</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <Input
          label="Mật khẩu hiện tại"
          type="password"
          value={form.oldPassword}
          onChange={setField('oldPassword')}
          error={errors.oldPassword}
          autoComplete="current-password"
        />
        <Input
          label="Mật khẩu mới"
          type="password"
          value={form.newPassword}
          onChange={setField('newPassword')}
          error={errors.newPassword}
          helperText="Tối thiểu 8 ký tự, gồm cả chữ và số."
          autoComplete="new-password"
        />
        <Input
          label="Xác nhận mật khẩu mới"
          type="password"
          value={form.confirm}
          onChange={setField('confirm')}
          error={errors.confirm}
          autoComplete="new-password"
        />
        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" loading={mutation.isPending}>
            Đổi mật khẩu
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/me')}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
