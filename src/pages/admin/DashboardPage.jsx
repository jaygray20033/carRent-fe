// src/pages/admin/DashboardPage.jsx
// Admin dashboard KPIs (Day 31 — UC-52).
//   - 4 KPI cards: revenue, bookings, new users, cancel rate
//   - LineChart of daily revenue (recharts)
//   - BarChart of top vehicle models by booking count
//   - DateRange filter (from/to), defaults to trailing 30 days on the BE
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Wallet, CalendarCheck, Users, XCircle } from 'lucide-react';
import { adminDashboardService } from '../../services/adminService.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import Button from '../../components/ui/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const unwrap = (res) => res?.data ?? res ?? {};

// Compact VND for chart axes / tooltips (e.g. 8,5 tr).
const formatCompact = (n) => {
  const num = Number(n) || 0;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} tỷ`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} tr`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return String(num);
};

const STATUS_LABEL = {
  DRAFT: 'Nháp',
  PENDING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  IN_USE: 'Đang sử dụng',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
};

function KpiCard({ icon: Icon, label, value, tone = 'primary' }) {
  const tones = {
    primary: 'bg-brand-primary/10 text-brand-primary',
    accent: 'bg-brand-accent/15 text-brand-accent-dark',
    success: 'bg-success/10 text-success',
    danger: 'bg-danger/10 text-danger',
  };
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase text-ink-300">{label}</p>
          <p className="mt-0.5 truncate text-xl font-bold text-ink-700">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // Draft (form) vs applied (query) range so typing doesn't refetch on each keystroke.
  const [draft, setDraft] = useState({ from: '', to: '' });
  const [range, setRange] = useState({ from: '', to: '' });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminDashboard', range.from, range.to],
    queryFn: () =>
      adminDashboardService.kpis({
        ...(range.from ? { from: range.from } : {}),
        ...(range.to ? { to: range.to } : {}),
      }),
    keepPreviousData: true,
  });

  const kpi = unwrap(data);
  const revenueByDay = kpi.revenueByDay || [];
  const topModels = kpi.topModels || [];
  const bookingsByStatus = kpi.bookingsByStatus || {};

  const applyRange = (e) => {
    e.preventDefault();
    if (draft.from && draft.to && draft.to < draft.from) return;
    setRange({ from: draft.from, to: draft.to });
  };

  const resetRange = () => {
    setDraft({ from: '', to: '' });
    setRange({ from: '', to: '' });
  };

  const cancelPct = kpi.cancelRate != null ? `${(kpi.cancelRate * 100).toFixed(1)}%` : '—';

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink-700">Tổng quan</h1>

        <form onSubmit={applyRange} className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-300">Từ ngày</label>
            <input
              type="date"
              value={draft.from}
              max={draft.to || undefined}
              onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
              className="input py-1.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-300">Đến ngày</label>
            <input
              type="date"
              value={draft.to}
              min={draft.from || undefined}
              onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
              className="input py-1.5"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Áp dụng
          </Button>
          {(range.from || range.to) && (
            <Button type="button" variant="outline" size="md" onClick={resetRange}>
              30 ngày gần nhất
            </Button>
          )}
        </form>
      </div>

      {isLoading ? (
        <div className="p-12">
          <Loading />
        </div>
      ) : (
        <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
          {/* KPI cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              icon={Wallet}
              tone="primary"
              label="Doanh thu"
              value={formatCurrency(kpi.totalRevenue)}
            />
            <KpiCard
              icon={CalendarCheck}
              tone="accent"
              label="Booking"
              value={(kpi.totalBookings ?? 0).toLocaleString('vi-VN')}
            />
            <KpiCard
              icon={Users}
              tone="success"
              label="Người dùng mới"
              value={(kpi.newUsers ?? 0).toLocaleString('vi-VN')}
            />
            <KpiCard icon={XCircle} tone="danger" label="Tỷ lệ hủy" value={cancelPct} />
          </div>

          {/* Charts */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Revenue line chart */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100 lg:col-span-2">
              <h2 className="mb-4 text-sm font-semibold text-ink-700">Doanh thu theo ngày</h2>
              {revenueByDay.length === 0 ? (
                <EmptyState title="Chưa có dữ liệu doanh thu" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueByDay} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EF" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#9AA3B5' }}
                      tickFormatter={(d) => formatDate(d, 'DD/MM')}
                      minTickGap={24}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#9AA3B5' }}
                      tickFormatter={formatCompact}
                      width={48}
                    />
                    <Tooltip
                      formatter={(v) => [formatCurrency(v), 'Doanh thu']}
                      labelFormatter={(d) => formatDate(d)}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#004EDE"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Bookings by status */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
              <h2 className="mb-4 text-sm font-semibold text-ink-700">Booking theo trạng thái</h2>
              {Object.keys(bookingsByStatus).length === 0 ? (
                <EmptyState title="Chưa có booking" />
              ) : (
                <ul className="space-y-2.5">
                  {Object.entries(bookingsByStatus)
                    .sort((a, b) => b[1] - a[1])
                    .map(([status, count]) => (
                      <li key={status} className="flex items-center justify-between text-sm">
                        <span className="text-ink-500">{STATUS_LABEL[status] || status}</span>
                        <span className="font-semibold text-ink-700">
                          {count.toLocaleString('vi-VN')}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          {/* Top vehicle models bar chart */}
          <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-4 text-sm font-semibold text-ink-700">
              Top 5 dòng xe theo số booking
            </h2>
            {topModels.length === 0 ? (
              <EmptyState title="Chưa có dữ liệu" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topModels} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EF" vertical={false} />
                  <XAxis
                    dataKey="modelName"
                    tick={{ fontSize: 11, fill: '#9AA3B5' }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#9AA3B5' }} allowDecimals={false} width={32} />
                  <Tooltip formatter={(v) => [v, 'Booking']} cursor={{ fill: '#F5F7FB' }} />
                  <Bar dataKey="bookings" fill="#FFB703" radius={[6, 6, 0, 0]} maxBarSize={64} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
