// src/pages/enterprise/DashboardPage.jsx
import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { enterpriseService } from '../../services/enterpriseService.js';
import Loading from '../../components/common/Loading.jsx';
import { formatCurrency } from '../../utils/format.js';

export default function EnterpriseDashboardPage() {
  const { isAdmin, corporate } = useOutletContext() || {};
  const { data, isLoading } = useQuery({
    queryKey: ['enterprise', 'dashboard'],
    queryFn: () => enterpriseService.dashboard(),
    enabled: Boolean(isAdmin),
  });
  const payload = data?.data ?? data ?? {};
  const current = payload.currentMonth || {};

  if (!isAdmin) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink-100">
        <h1 className="text-xl font-bold text-ink-700">Xin chào</h1>
        <p className="mt-2 text-sm text-ink-500">
          Bạn đang đăng nhập Enterprise Portal của{' '}
          <strong>{corporate?.name || 'công ty'}</strong>. Dùng menu bên trái để đặt chuyến hoặc xem
          lịch.
        </p>
      </div>
    );
  }

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink-700">Dashboard doanh nghiệp</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Chuyến tháng này', value: current.totalTrips ?? 0 },
          {
            label: 'Chi phí tháng',
            value: formatCurrency(current.totalAmount || 0),
          },
          { label: 'Chờ duyệt', value: current.pendingApproval ?? 0 },
          { label: 'Chờ xác nhận CP', value: current.pendingConfirm ?? 0 },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100"
          >
            <div className="text-xs uppercase tracking-wide text-ink-400">{k.label}</div>
            <div className="mt-2 text-2xl font-bold text-ink-700">{k.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
