// src/pages/enterprise/DashboardPage.jsx
import { Link, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
        <Link
          to="/enterprise/new-booking"
          className="mt-4 inline-flex rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Đặt chuyến mới
        </Link>
      </div>
    );
  }

  if (isLoading) return <Loading />;

  const pending = current.pendingApproval ?? 0;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink-700">Dashboard doanh nghiệp</h1>
      {pending > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div>
            <div className="font-semibold text-amber-900">
              Có {pending} chuyến đang chờ duyệt
            </div>
            <div className="text-sm text-amber-800">
              Nhân viên đã gửi yêu cầu — cần Corporate Admin duyệt trước khi OtoRent điều xe.
            </div>
          </div>
          <Link
            to="/enterprise/schedule"
            className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Đi duyệt ngay
          </Link>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Chuyến tháng này', value: current.totalTrips ?? 0 },
          {
            label: 'Chi phí tháng',
            value: formatCurrency(current.totalAmount || 0),
          },
          { label: 'Chờ duyệt', value: pending },
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
