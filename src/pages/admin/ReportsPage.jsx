// src/pages/admin/ReportsPage.jsx
// Admin reports (Day 35 — UC-59).
//   - Report type picker: Doanh thu | Đơn thuê | Top xe
//   - Date range filter (from/to) + group day|month for revenue
//   - Revenue: KPI total + line chart series + method breakdown + Export CSV/Excel/PDF
//   - Booking: counts by status
//   - Top vehicles: most-booked table
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import { Wallet, ClipboardList, Trophy, Download } from 'lucide-react';
import { adminReportsService } from '../../services/adminService.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import Button from '../../components/ui/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const unwrap = (res) => res?.data ?? res ?? {};

const formatCompact = (n) => {
  const num = Number(n) || 0;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} tỷ`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} tr`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return String(num);
};

const REPORT_TABS = [
  { id: 'revenue', label: 'Doanh thu', icon: Wallet },
  { id: 'booking', label: 'Đơn thuê', icon: ClipboardList },
  { id: 'top-vehicles', label: 'Top xe', icon: Trophy },
  { id: 'b2b-c2c', label: 'B2B vs C2C', icon: Wallet },
];

const METHOD_LABEL = {
  VNPAY: 'VNPay',
  MOMO: 'MoMo',
  BANK_TRANSFER: 'Chuyển khoản',
  CASH: 'Tiền mặt',
  WALLET: 'Ví',
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

const EXT = { csv: 'csv', excel: 'xlsx', pdf: 'pdf' };

export default function ReportsPage() {
  const [tab, setTab] = useState('revenue');
  const [group, setGroup] = useState('day');
  const [draft, setDraft] = useState({ from: '', to: '' });
  const [range, setRange] = useState({ from: '', to: '' });
  const [exporting, setExporting] = useState(false);

  const rangeParams = {
    ...(range.from ? { from: range.from } : {}),
    ...(range.to ? { to: range.to } : {}),
  };

  const monthParam =
    range.from && /^\d{4}-\d{2}/.test(range.from) ? range.from.slice(0, 7) : undefined;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminReport', tab, range.from, range.to, group, monthParam],
    queryFn: () => {
      if (tab === 'revenue')
        return adminReportsService.revenue({ ...rangeParams, group });
      if (tab === 'booking') return adminReportsService.booking(rangeParams);
      if (tab === 'b2b-c2c')
        return adminReportsService.b2bVsC2c(monthParam ? { month: monthParam } : {});
      return adminReportsService.topVehicles({ ...rangeParams, limit: 10 });
    },
    keepPreviousData: true,
  });

  const report = unwrap(data);

  const applyRange = (e) => {
    e.preventDefault();
    if (draft.from && draft.to && draft.to < draft.from) return;
    setRange({ from: draft.from, to: draft.to });
  };

  const resetRange = () => {
    setDraft({ from: '', to: '' });
    setRange({ from: '', to: '' });
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      const blob = await adminReportsService.exportRevenue({
        ...rangeParams,
        group,
        format,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bao-cao-doanh-thu-${Date.now()}.${EXT[format]}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Xuất báo cáo thất bại');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink-700">Báo cáo</h1>

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

      {/* Report tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {REPORT_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-brand-primary text-white'
                : 'bg-white text-ink-500 ring-1 ring-ink-100 hover:bg-ink-50'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="p-12">
          <Loading />
        </div>
      ) : (
        <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
          {tab === 'revenue' && <RevenueReport report={report} group={group} setGroup={setGroup} onExport={handleExport} exporting={exporting} />}
          {tab === 'booking' && <BookingReport report={report} />}
          {tab === 'top-vehicles' && <TopVehiclesReport report={report} />}
          {tab === 'b2b-c2c' && <B2bVsC2cReport report={report} />}
        </div>
      )}
    </div>
  );
}

function B2bVsC2cReport({ report }) {
  const b2b = report?.b2b || {};
  const c2c = report?.c2c || {};
  const byCorporate = b2b.byCorporate || [];
  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-400">
        Tháng {report?.month || '—'} · B2B = CONFIRMED/SETTLED corporate · C2C = SUCCESS payments BOOKING
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
          <p className="text-xs font-medium uppercase text-ink-300">Doanh thu B2B</p>
          <p className="mt-1 text-2xl font-bold text-ink-700">{formatCurrency(b2b.total || 0)}</p>
          <p className="text-xs text-ink-400">{b2b.trips || 0} chuyến · {report?.b2bShare ?? 0}%</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
          <p className="text-xs font-medium uppercase text-ink-300">Doanh thu C2C</p>
          <p className="mt-1 text-2xl font-bold text-ink-700">{formatCurrency(c2c.total || 0)}</p>
          <p className="text-xs text-ink-400">{c2c.payments || 0} GD · {report?.c2cShare ?? 0}%</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
          <p className="text-xs font-medium uppercase text-ink-300">Tổng</p>
          <p className="mt-1 text-2xl font-bold text-brand-primary">
            {formatCurrency(report?.grandTotal || 0)}
          </p>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <h2 className="mb-3 text-sm font-semibold text-ink-700">B2B theo công ty</h2>
        {byCorporate.length === 0 ? (
          <EmptyState title="Chưa có doanh thu B2B tháng này" />
        ) : (
          <ul className="divide-y divide-ink-50 text-sm">
            {byCorporate.map((r) => (
              <li key={r.corporateId} className="flex justify-between py-2">
                <span>{r.name}</span>
                <span>
                  {r.trips} chuyến · <strong>{formatCurrency(r.revenue)}</strong>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function RevenueReport({ report, group, setGroup, onExport, exporting }) {
  const series = report.series || [];
  const byMethod = report.byMethod || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-white p-1 ring-1 ring-ink-100">
          {['day', 'month'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                group === g ? 'bg-brand-primary/10 text-brand-primary' : 'text-ink-400'
              }`}
            >
              {g === 'day' ? 'Theo ngày' : 'Theo tháng'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onExport('csv')} disabled={exporting}>
            <Download className="mr-1 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport('excel')} disabled={exporting}>
            <Download className="mr-1 h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport('pdf')} disabled={exporting}>
            <Download className="mr-1 h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
          <p className="text-xs font-medium uppercase text-ink-300">Tổng doanh thu</p>
          <p className="mt-1 text-2xl font-bold text-ink-700">{formatCurrency(report.total)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
          <p className="text-xs font-medium uppercase text-ink-300">Số giao dịch</p>
          <p className="mt-1 text-2xl font-bold text-ink-700">
            {(report.count ?? 0).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      {/* Series chart */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <h2 className="mb-4 text-sm font-semibold text-ink-700">
          Doanh thu {group === 'month' ? 'theo tháng' : 'theo ngày'}
        </h2>
        {series.length === 0 ? (
          <EmptyState title="Chưa có dữ liệu doanh thu" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={series} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EF" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11, fill: '#9AA3B5' }}
                tickFormatter={(d) => (group === 'month' ? d : formatDate(d, 'DD/MM'))}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9AA3B5' }}
                tickFormatter={formatCompact}
                width={48}
              />
              <Tooltip
                formatter={(v) => [formatCurrency(v), 'Doanh thu']}
                labelFormatter={(d) => (group === 'month' ? d : formatDate(d))}
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

      {/* Method breakdown */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <h2 className="mb-4 text-sm font-semibold text-ink-700">Theo phương thức thanh toán</h2>
        {byMethod.length === 0 ? (
          <EmptyState title="Chưa có dữ liệu" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase text-ink-300">
                  <th className="pb-2">Phương thức</th>
                  <th className="pb-2 text-right">Số giao dịch</th>
                  <th className="pb-2 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {byMethod.map((m) => (
                  <tr key={m.method} className="border-b border-ink-50 last:border-0">
                    <td className="py-2.5 text-ink-700">{METHOD_LABEL[m.method] || m.method}</td>
                    <td className="py-2.5 text-right text-ink-500">
                      {(m.count ?? 0).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-ink-700">
                      {formatCurrency(m.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingReport({ report }) {
  const byStatus = report.byStatus || [];
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <p className="text-xs font-medium uppercase text-ink-300">Tổng đơn</p>
        <p className="mt-1 text-2xl font-bold text-ink-700">
          {(report.total ?? 0).toLocaleString('vi-VN')}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <h2 className="mb-4 text-sm font-semibold text-ink-700">Đơn thuê theo trạng thái</h2>
        {byStatus.length === 0 ? (
          <EmptyState title="Chưa có đơn thuê" />
        ) : (
          <ul className="space-y-2.5">
            {byStatus.map((s) => (
              <li key={s.status} className="flex items-center justify-between text-sm">
                <span className="text-ink-500">{STATUS_LABEL[s.status] || s.status}</span>
                <span className="font-semibold text-ink-700">
                  {(s.count ?? 0).toLocaleString('vi-VN')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TopVehiclesReport({ report }) {
  const items = report.items || [];
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
      <h2 className="mb-4 text-sm font-semibold text-ink-700">Xe được thuê nhiều nhất</h2>
      {items.length === 0 ? (
        <EmptyState title="Chưa có dữ liệu" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase text-ink-300">
                <th className="pb-2">#</th>
                <th className="pb-2">Xe</th>
                <th className="pb-2">Dòng xe</th>
                <th className="pb-2">Biển số</th>
                <th className="pb-2 text-right">Lượt thuê</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v, i) => (
                <tr key={v.vehicleId} className="border-b border-ink-50 last:border-0">
                  <td className="py-2.5 text-ink-300">{i + 1}</td>
                  <td className="py-2.5 font-medium text-ink-700">{v.name}</td>
                  <td className="py-2.5 text-ink-500">
                    {[v.brandName, v.modelName].filter(Boolean).join(' ') || '-'}
                  </td>
                  <td className="py-2.5 text-ink-500">{v.licensePlate || '-'}</td>
                  <td className="py-2.5 text-right font-semibold text-ink-700">
                    {(v.bookings ?? 0).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
