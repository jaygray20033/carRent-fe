// src/pages/supplier/DashboardPage.jsx — Supplier portal overview.
import { useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Wallet, Truck, AlertTriangle } from 'lucide-react';
import { supplierPortalService } from '../../services/supplierService.js';
import Loading from '../../components/common/Loading.jsx';

const unwrap = (res) => res?.data ?? res ?? {};
const listOf = (res) => {
  const p = unwrap(res);
  return Array.isArray(p) ? p : p.items || [];
};

function StatCard({ icon: Icon, label, value, to }) {
  const body = (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-brand-primary/10 p-2 text-brand-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-2xl font-bold text-ink-800">{value}</div>
          <div className="text-sm text-ink-400">{label}</div>
        </div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

export default function SupplierDashboardPage() {
  const { supplier } = useOutletContext() || {};

  const { data: bookingsRes, isLoading } = useQuery({
    queryKey: ['supplier', 'bookings', 'dashboard'],
    queryFn: () => supplierPortalService.listBookings({ size: 100 }),
  });
  const { data: payoutRes } = useQuery({
    queryKey: ['supplier', 'settlements', 'dashboard'],
    queryFn: () => supplierPortalService.listSettlements({ size: 100 }),
  });

  const bookings = listOf(bookingsRes);
  const settlements = listOf(payoutRes);

  const stats = useMemo(() => {
    const active = bookings.filter((b) =>
      ['DISPATCHED', 'DRIVER_ASSIGNED', 'IN_PROGRESS'].includes(b.status)
    ).length;
    const newDispatch = bookings.filter((b) => b.status === 'DISPATCHED').length;
    const pendingPayout = settlements.filter((s) => s.status !== 'PAID').length;
    return { active, newDispatch, pendingPayout };
  }, [bookings, settlements]);

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-700">Xin chào, {supplier?.name}</h1>
        <p className="text-sm text-ink-400">Tổng quan hoạt động điều phối của bạn</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Truck}
          label="Chuyến mới cần phân tài xế"
          value={stats.newDispatch}
          to="/supplier/bookings?status=DISPATCHED"
        />
        <StatCard icon={ClipboardList} label="Chuyến đang hoạt động" value={stats.active} />
        <StatCard
          icon={Wallet}
          label="Kỳ payout chờ xử lý"
          value={stats.pendingPayout}
          to="/supplier/settlements"
        />
      </div>

      {stats.newDispatch > 0 && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            Bạn có {stats.newDispatch} chuyến mới cần phân công tài xế.{' '}
            <Link to="/supplier/bookings?status=DISPATCHED" className="font-semibold underline">
              Xem ngay
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
