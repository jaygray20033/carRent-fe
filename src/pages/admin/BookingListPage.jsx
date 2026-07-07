// src/pages/admin/BookingListPage.jsx
// Admin booking management (Day 33 — UC-54). Filterable table with a status
// filter, pickup-date range, free-text search, and quick inline actions
// (confirm payment / start / return) routed through the admin booking API.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, CheckCircle2, PlayCircle, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminBookingService } from '../../services/adminService.js';
import { formatCurrency, formatDateTime } from '../../utils/format.js';
import { statusLabel, statusColor } from '../../utils/bookingStatus.js';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';

const PAGE_SIZE = 20;
const unwrap = (res) => res?.data ?? res ?? {};
const listOf = (res) => {
  const p = unwrap(res);
  return Array.isArray(p) ? p : p.items || [];
};

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'IN_USE', label: 'Đang dùng' },
  { value: 'COMPLETED', label: 'Hoàn tất' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền' },
];

export default function BookingListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({ status: '', from: '', to: '' });
  const [q, setQ] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminBookings', filters, searchTerm, page],
    queryFn: () =>
      adminBookingService.list({
        page,
        limit: PAGE_SIZE,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
        ...(searchTerm ? { q: searchTerm } : {}),
      }),
    keepPreviousData: true,
  });

  const list = listOf(data);
  const meta = data?.meta ?? {};
  const total = meta.total ?? list.length;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['adminBookings'] });

  const confirmMutation = useMutation({
    mutationFn: (id) => adminBookingService.confirmPayment(id, { method: 'BANK_TRANSFER' }),
    onSuccess: () => {
      toast.success('Đã xác nhận thanh toán');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể xác nhận thanh toán'),
  });

  const startMutation = useMutation({
    mutationFn: (id) => adminBookingService.start(id),
    onSuccess: () => {
      toast.success('Đã bắt đầu chuyến (IN_USE)');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể bắt đầu chuyến'),
  });

  const returnMutation = useMutation({
    mutationFn: (id) => adminBookingService.return(id, {}),
    onSuccess: () => {
      toast.success('Đã tất toán chuyến (COMPLETED)');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể tất toán chuyến'),
  });

  const setFilter = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(q.trim());
    setPage(1);
  };

  const anyPending =
    confirmMutation.isPending || startMutation.isPending || returnMutation.isPending;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink-700">Quản lý đơn thuê</h1>
        <span className="text-sm text-ink-300">{total} đơn</span>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={filters.status} onChange={setFilter('status')} options={STATUS_OPTIONS} />
        <Input type="date" value={filters.from} onChange={setFilter('from')} placeholder="Từ ngày" />
        <Input type="date" value={filters.to} onChange={setFilter('to')} placeholder="Đến ngày" />
        <form onSubmit={handleSearch}>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Mã đơn / tên / SĐT / email…"
            leftIcon={<Search className="h-4 w-4" />}
          />
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
        {isLoading ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : list.length === 0 ? (
          <div className="p-8">
            <EmptyState title="Không có đơn nào" description="Thử đổi bộ lọc hoặc khoảng ngày." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isFetching ? 'opacity-60' : ''}`}>
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase text-ink-300">
                  <th className="px-4 py-3 font-medium">Mã đơn</th>
                  <th className="px-4 py-3 font-medium">Khách</th>
                  <th className="px-4 py-3 font-medium">Xe</th>
                  <th className="px-4 py-3 font-medium">Nhận xe</th>
                  <th className="px-4 py-3 font-medium">Tổng tiền</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40">
                    <td className="px-4 py-3 font-mono text-xs text-ink-700">{b.bookingCode}</td>
                    <td className="px-4 py-3 text-ink-500">
                      <p className="font-medium text-ink-700">{b.user?.fullName || '—'}</p>
                      <p className="text-xs text-ink-300">{b.user?.phone || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      <p className="truncate">{b.vehicle?.name || '—'}</p>
                      <p className="font-mono text-xs text-ink-300">{b.vehicle?.licensePlate || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{formatDateTime(b.pickupAt)}</td>
                    <td className="px-4 py-3 font-medium text-ink-700">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${statusColor(b.status)}`}
                      >
                        {statusLabel(b.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {b.status === 'PENDING_PAYMENT' && (
                          <button
                            type="button"
                            onClick={() => confirmMutation.mutate(b.id)}
                            disabled={anyPending}
                            title="Xác nhận thanh toán (chuyển khoản / tiền mặt)"
                            className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-success/5 hover:text-success disabled:opacity-40"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <button
                            type="button"
                            onClick={() => startMutation.mutate(b.id)}
                            disabled={anyPending}
                            title="Bắt đầu chuyến"
                            className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-info/5 hover:text-info disabled:opacity-40"
                          >
                            <PlayCircle className="h-4 w-4" />
                          </button>
                        )}
                        {b.status === 'IN_USE' && (
                          <button
                            type="button"
                            onClick={() => returnMutation.mutate(b.id)}
                            disabled={anyPending}
                            title="Tất toán chuyến"
                            className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-warning/5 hover:text-warning disabled:opacity-40"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/bookings/${b.id}`)}
                          title="Xem chi tiết"
                          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-primary"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
