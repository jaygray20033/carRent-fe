// src/pages/supplier/BookingsPage.jsx — supplier dispatched-booking queue.
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react';
import { supplierPortalService, BOOKING_STATUS_LABEL } from '../../services/supplierService.js';
import { formatDateTime } from '../../utils/format.js';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';

const PAGE_SIZE = 20;
const unwrap = (res) => res?.data ?? res ?? {};
const listOf = (res) => {
  const p = unwrap(res);
  return Array.isArray(p) ? p : p.items || [];
};

const STATUS_TABS = [
  { value: '', label: 'Tất cả' },
  { value: 'DISPATCHED', label: 'Mới điều phối' },
  { value: 'DRIVER_ASSIGNED', label: 'Đã phân tài xế' },
  { value: 'IN_PROGRESS', label: 'Đang chạy' },
  { value: 'PENDING_CONFIRM', label: 'Chờ xác nhận' },
  { value: 'SETTLED', label: 'Đã quyết toán' },
];

const STATUS_BADGE = {
  DISPATCHED: 'bg-sky-100 text-sky-700',
  DRIVER_ASSIGNED: 'bg-violet-100 text-violet-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  PENDING_CONFIRM: 'bg-orange-100 text-orange-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  SETTLED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function SupplierBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['supplier', 'bookings', status, page],
    queryFn: () =>
      supplierPortalService.listBookings({
        page,
        size: PAGE_SIZE,
        ...(status ? { status } : {}),
      }),
    keepPreviousData: true,
  });

  const list = listOf(data);
  const meta = data?.meta ?? {};
  const total = meta.total ?? list.length;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  const setStatus = (value) => {
    setPage(1);
    setSearchParams(value ? { status: value } : {});
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink-700">Chuyến điều phối</h1>
        <span className="text-sm text-ink-300">{total} chuyến</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              status === tab.value
                ? 'bg-brand-primary text-white'
                : 'bg-white text-ink-500 ring-1 ring-ink-100 hover:bg-ink-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState title="Chưa có chuyến nào" icon={ClipboardList} />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
          <table className="min-w-full text-sm">
            <thead className="bg-ink-50 text-left text-ink-400">
              <tr>
                <th className="px-4 py-3 font-medium">Mã</th>
                <th className="px-4 py-3 font-medium">Lộ trình</th>
                <th className="px-4 py-3 font-medium">Đón khách</th>
                <th className="px-4 py-3 font-medium">Tài xế</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.id} className="border-t border-ink-50 hover:bg-ink-50/60">
                  <td className="px-4 py-3">
                    <Link
                      to={`/supplier/bookings/${b.id}`}
                      className="font-semibold text-brand-primary"
                    >
                      #{b.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink-700">{b.pickupAddress}</div>
                    <div className="text-xs text-ink-400">→ {b.dropoffAddress}</div>
                  </td>
                  <td className="px-4 py-3">{formatDateTime(b.pickupAt)}</td>
                  <td className="px-4 py-3">
                    {b.supplierMember?.fullName ||
                      b.supplierMember?.user?.fullName || (
                        <span className="text-ink-300">Chưa phân</span>
                      )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_BADGE[b.status] || 'bg-ink-100 text-ink-500'
                      }`}
                    >
                      {BOOKING_STATUS_LABEL[b.status] || b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
