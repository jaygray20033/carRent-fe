// src/pages/user/ChangePhonePage.jsx
// UC-41 — change phone in two steps:
//   step 1 "request": enter the new phone → BE sends an OTP to that number.
//   step 2 "verify":  enter the OTP → BE applies the new phone + stamps verified.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService.js';
import { useAuthStore } from '../../store/authStore.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import OtpInput from '../../components/auth/OtpInput.jsx';

const phoneRegex = /^(\+?84|0)\d{9,10}$/;

export default function ChangePhonePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  const [step, setStep] = useState('request'); // 'request' | 'verify'
  const [newPhone, setNewPhone] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState({});

  const requestMutation = useMutation({
    mutationFn: (payload) => userService.requestPhoneChange(payload),
    onSuccess: () => {
      toast.success('Đã gửi mã OTP đến số điện thoại mới');
      setStep('verify');
    },
    onError: (err) => {
      if (err?.code === 'PHONE_EXISTS') setErrors({ newPhone: 'Số điện thoại đã được sử dụng' });
      else if (err?.code === 'PHONE_SAME')
        setErrors({ newPhone: 'Số mới phải khác số hiện tại' });
      toast.error(err?.message || 'Không thể gửi OTP');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (payload) => userService.verifyPhoneChange(payload),
    onSuccess: (res) => {
      const updated = res?.data?.user;
      if (updated) setUser(updated);
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Đã cập nhật số điện thoại');
      navigate('/me');
    },
    onError: (err) => {
      if (err?.code === 'OTP_INVALID') {
        const left = err?.details?.attemptsLeft;
        setErrors({ code: left != null ? `Mã sai. Còn ${left} lần thử` : 'Mã OTP không đúng' });
      } else if (err?.code === 'OTP_EXPIRED') {
        setErrors({ code: 'Mã OTP đã hết hạn, vui lòng gửi lại' });
      }
      toast.error(err?.message || 'Xác thực OTP thất bại');
    },
  });

  const submitRequest = (e) => {
    e.preventDefault();
    if (!phoneRegex.test(newPhone.trim())) {
      setErrors({ newPhone: 'Số điện thoại không hợp lệ' });
      return;
    }
    setErrors({});
    requestMutation.mutate({ newPhone: newPhone.trim() });
  };

  const submitVerify = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setErrors({ code: 'Nhập đủ 6 chữ số' });
      return;
    }
    setErrors({});
    verifyMutation.mutate({ code });
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 md:p-8">
      <div className="mb-6 flex items-center gap-3 border-b border-ink-100 pb-5">
        <button
          type="button"
          onClick={() => (step === 'verify' ? setStep('request') : navigate('/me'))}
          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50"
          title="Quay lại"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-ink-900">Đổi số điện thoại</h1>
      </div>

      {step === 'request' ? (
        <form onSubmit={submitRequest} className="max-w-md space-y-4">
          <Input
            label="Số điện thoại mới"
            type="tel"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            error={errors.newPhone}
            placeholder="VD: 0912345678"
            helperText="Mã OTP sẽ được gửi đến số này để xác thực."
            autoFocus
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" loading={requestMutation.isPending}>
              Gửi mã OTP
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/me')}>
              Hủy
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={submitVerify} className="max-w-md space-y-5">
          <p className="text-sm text-ink-500">
            Nhập mã 6 số vừa gửi đến <span className="font-semibold text-ink-900">{newPhone}</span>.
          </p>
          <OtpInput value={code} onChange={setCode} error={Boolean(errors.code)} />
          {errors.code && <p className="text-xs text-danger">{errors.code}</p>}
          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" variant="primary" loading={verifyMutation.isPending}>
              Xác nhận
            </Button>
            <button
              type="button"
              onClick={() => requestMutation.mutate({ newPhone: newPhone.trim() })}
              disabled={requestMutation.isPending}
              className="text-sm font-medium text-brand-primary hover:underline disabled:opacity-60"
            >
              Gửi lại mã
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
