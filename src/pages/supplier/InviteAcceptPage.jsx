import { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Truck, UserCircle2 } from 'lucide-react';
import { supplierPortalService } from '../../services/supplierService.js';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../../components/ui/Button.jsx';

export default function SupplierInviteAcceptPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const token = searchParams.get('token') || '';

  // 'confirm' → show which account will be bound; 'done' → success; 'error'.
  const [phase, setPhase] = useState(token ? 'confirm' : 'error');
  const [message, setMessage] = useState(token ? '' : 'Link mời không có token.');
  const [submitting, setSubmitting] = useState(false);

  const accept = async () => {
    setSubmitting(true);
    try {
      await supplierPortalService.acceptInvite(token);
      setPhase('done');
      setMessage('Bạn đã tham gia nhà cung cấp thành công.');
    } catch (error) {
      setPhase('error');
      setMessage(error?.message || 'Không thể chấp nhận lời mời.');
    } finally {
      setSubmitting(false);
    }
  };

  // Switch account: sign out but come back to this exact invite URL after login.
  const switchAccount = async () => {
    const returnTo = `${location.pathname}${location.search}`;
    await logout();
    navigate('/login', { state: { from: returnTo }, replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-ink-100">
        <Truck className="mx-auto h-10 w-10 text-brand-primary" />

        {phase === 'confirm' && (
          <>
            <h1 className="mt-4 text-xl font-bold text-ink-700">Lời mời làm tài xế</h1>
            <p className="mt-2 text-sm text-ink-500">
              Bạn sẽ tham gia nhà cung cấp với tài khoản dưới đây. Hãy kiểm tra đúng tài khoản
              trước khi xác nhận.
            </p>
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-ink-50 p-4 text-left">
              <UserCircle2 className="h-9 w-9 shrink-0 text-ink-400" />
              <div className="min-w-0">
                <div className="truncate font-semibold text-ink-700">
                  {user?.fullName || 'Tài khoản của bạn'}
                </div>
                <div className="truncate text-xs text-ink-400">
                  {user?.phone || user?.email || ''}
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <Button className="w-full" loading={submitting} onClick={accept}>
                Xác nhận tham gia
              </Button>
              <button
                type="button"
                onClick={switchAccount}
                className="w-full text-sm font-medium text-ink-500 hover:text-ink-700"
              >
                Không phải bạn? Đổi tài khoản
              </button>
            </div>
          </>
        )}

        {phase === 'done' && (
          <>
            <CheckCircle2 className="mx-auto mt-5 h-12 w-12 text-emerald-600" />
            <h1 className="mt-3 text-xl font-bold text-ink-700">Xác nhận thành công</h1>
            <p className="mt-2 text-sm text-ink-500">{message}</p>
            <div className="mt-6">
              <Button className="w-full" onClick={() => navigate('/supplier')}>
                Vào cổng nhà cung cấp
              </Button>
            </div>
          </>
        )}

        {phase === 'error' && (
          <>
            <AlertCircle className="mx-auto mt-5 h-12 w-12 text-red-600" />
            <h1 className="mt-3 text-xl font-bold text-ink-700">Không thể xác nhận</h1>
            <p className="mt-2 text-sm text-ink-500">{message}</p>
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={switchAccount}
                className="w-full text-sm font-medium text-brand-primary hover:underline"
              >
                Thử với tài khoản khác
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full text-sm font-medium text-ink-400 hover:text-ink-600"
              >
                Về trang chủ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
