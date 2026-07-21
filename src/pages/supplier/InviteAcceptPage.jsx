import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Truck } from 'lucide-react';
import { supplierPortalService } from '../../services/supplierService.js';
import Button from '../../components/ui/Button.jsx';
import Loading from '../../components/common/Loading.jsx';

export default function SupplierInviteAcceptPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [state, setState] = useState({ loading: Boolean(token), success: false, message: '' });

  useEffect(() => {
    let cancelled = false;
    async function accept() {
      if (!token) {
        setState({ loading: false, success: false, message: 'Link mời không có token.' });
        return;
      }
      try {
        await supplierPortalService.acceptInvite(token);
        if (!cancelled) {
          setState({
            loading: false,
            success: true,
            message: 'Bạn đã tham gia nhà cung cấp thành công.',
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            loading: false,
            success: false,
            message: error?.message || 'Không thể chấp nhận lời mời.',
          });
        }
      }
    }
    accept();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.loading) return <Loading label="Đang xác nhận lời mời..." />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-ink-100">
        <Truck className="mx-auto h-10 w-10 text-brand-primary" />
        {state.success ? (
          <CheckCircle2 className="mx-auto mt-5 h-12 w-12 text-emerald-600" />
        ) : (
          <AlertCircle className="mx-auto mt-5 h-12 w-12 text-red-600" />
        )}
        <h1 className="mt-3 text-xl font-bold text-ink-700">
          {state.success ? 'Xác nhận thành công' : 'Không thể xác nhận'}
        </h1>
        <p className="mt-2 text-sm text-ink-500">{state.message}</p>
        <div className="mt-6">
          {state.success ? (
            <Button onClick={() => navigate('/supplier')}>Vào cổng nhà cung cấp</Button>
          ) : (
            <Link to="/" className="text-sm font-semibold text-brand-primary">
              Về trang chủ
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
