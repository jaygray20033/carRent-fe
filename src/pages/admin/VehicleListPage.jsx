// src/pages/admin/VehicleListPage.jsx
// Admin vehicle management (Day 32 — UC-53). Table with status/station/brand
// filters + search, a quick status change, and a booking-history drawer.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, History, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminVehicleService } from '../../services/adminService.js';
import { brandService } from '../../services/brandService.js';
import { stationService } from '../../services/stationService.js';
import { formatCurrency, formatDateTime } from '../../utils/format.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Modal from '../../components/ui/Modal.jsx';
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
  { value: 'AVAILABLE', label: 'Sẵn sàng' },
  { value: 'RENTED', label: 'Đang thuê' },
  { value: 'MAINTENANCE', label: 'Bảo trì' },
  { value: 'RETIRED', label: 'Ngừng dùng' },
];

// Statuses an admin can set directly (RENTED is booking-driven, excluded).
const QUICK_STATUS = [
  { value: 'AVAILABLE', label: 'Sẵn sàng' },
  { value: 'MAINTENANCE', label: 'Bảo trì' },
  { value: 'RETIRED', label: 'Ngừng dùng' },
];

const STATUS_BADGE = {
  AVAILABLE: 'bg-success/10 text-success',
  RENTED: 'bg-info/10 text-info',
  MAINTENANCE: 'bg-warning/10 text-warning',
  RETIRED: 'bg-ink-100 text-ink-500',
};
const STATUS_LABEL = {
  AVAILABLE: 'Sẵn sàng',
  RENTED: 'Đang thuê',
  MAINTENANCE: 'Bảo trì',
  RETIRED: 'Ngừng dùng',
};

// ── Booking-history modal ──────────────────────────────────────────────
function BookingHistoryModal({ vehicle, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['adminVehicleBookings', vehicle?.id],
    queryFn: () => adminVehicleService.bookings(vehicle.id, { limit: 50 }),
    enabled: Boolean(vehicle),
  });
  const bookings = listOf(data);

  return (
    <Modal open={Boolean(vehicle)} onClose={onClose} size="2xl" title={`Lịch sử booking — ${vehicle?.name || ''}`}>
      {isLoading ? (
        <div className="py-8">
          <Loading />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState title="Chưa có booking nào" description="Xe này chưa từng được đặt." />
      ) : (
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase text-ink-300">
                <th className="px-3 py-2 font-medium">Mã</th>
                <th className="px-3 py-2 font-medium">Khách</th>
                <th className="px-3 py-2 font-medium">Nhận xe</th>
                <th className="px-3 py-2 font-medium">Trạng thái</th>
                <th className="px-3 py-2 text-right font-medium">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-ink-50 last:border-0">
                  <td className="px-3 py-2 font-mono text-xs text-ink-700">{b.bookingCode}</td>
                  <td className="px-3 py-2 text-ink-500">{b.user?.fullName || '—'}</td>
                  <td className="px-3 py-2 text-ink-500">{formatDateTime(b.pickupAt)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                        STATUS_BADGE[b.status] || 'bg-ink-100 text-ink-500'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-ink-700">
                    {formatCurrency(b.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

export default function VehicleListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({ status: '', brandId: '', stationId: '' });
  const [q, setQ] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [historyVehicle, setHistoryVehicle] = useState(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminVehicles', filters, searchTerm, page],
    queryFn: () =>
      adminVehicleService.list({
        page,
        limit: PAGE_SIZE,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.brandId ? { brandId: filters.brandId } : {}),
        ...(filters.stationId ? { stationId: filters.stationId } : {}),
        ...(searchTerm ? { q: searchTerm } : {}),
      }),
    keepPreviousData: true,
  });

  // Filter option sources.
  const { data: brandData } = useQuery({ queryKey: ['brands'], queryFn: () => brandService.list() });
  const { data: stationData } = useQuery({
    queryKey: ['stations', 'all'],
    queryFn: () => stationService.list({ size: 100 }),
  });

  const brandOptions = [
    { value: '', label: 'Tất cả hãng' },
    ...listOf(brandData).map((b) => ({ value: String(b.id), label: b.name })),
  ];
  const stationOptions = [
    { value: '', label: 'Tất cả trạm' },
    ...listOf(stationData).map((s) => ({ value: String(s.id), label: s.name })),
  ];

  const list = listOf(data);
  const meta = data?.meta ?? {};
  const total = meta.total ?? list.length;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminVehicleService.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái xe');
      queryClient.invalidateQueries({ queryKey: ['adminVehicles'] });
    },
    onError: (e) => toast.error(e?.message || 'Không thể cập nhật trạng thái'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminVehicleService.remove(id),
    onSuccess: () => {
      toast.success('Đã ngừng sử dụng xe (RETIRED)');
      queryClient.invalidateQueries({ queryKey: ['adminVehicles'] });
    },
    onError: (e) => toast.error(e?.message || 'Không thể xóa xe'),
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

  const handleDelete = (v) => {
    if (window.confirm(`Ngừng sử dụng xe "${v.name}" (${v.licensePlate})?`)) {
      deleteMutation.mutate(v.id);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink-700">Quản lý xe</h1>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => navigate('/admin/vehicles/new')}
        >
          Thêm xe
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={filters.status} onChange={setFilter('status')} options={STATUS_OPTIONS} />
        <Select value={filters.brandId} onChange={setFilter('brandId')} options={brandOptions} />
        <Select
          value={filters.stationId}
          onChange={setFilter('stationId')}
          options={stationOptions}
        />
        <form onSubmit={handleSearch}>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm tên / biển số…"
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
            <EmptyState title="Không có xe" description="Thử đổi bộ lọc hoặc thêm xe mới." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isFetching ? 'opacity-60' : ''}`}>
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase text-ink-300">
                  <th className="px-4 py-3 font-medium">Xe</th>
                  <th className="px-4 py-3 font-medium">Biển số</th>
                  <th className="px-4 py-3 font-medium">Hãng / Trạm</th>
                  <th className="px-4 py-3 font-medium">Giá/ngày</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((v) => (
                  <tr key={v.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-50">
                          {v.thumbnailUrl ? (
                            <img
                              src={v.thumbnailUrl}
                              alt={v.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Car className="h-4 w-4 text-ink-300" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink-700">{v.name}</p>
                          <p className="truncate text-xs text-ink-300">{v.model?.name || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-ink-500">{v.licensePlate}</td>
                    <td className="px-4 py-3 text-ink-500">
                      <p>{v.brand?.name || '—'}</p>
                      <p className="text-xs text-ink-300">{v.station?.name || 'Chưa gán trạm'}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink-700">
                      {formatCurrency(v.pricePerDay)}
                    </td>
                    <td className="px-4 py-3">
                      {v.status === 'RENTED' ? (
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_BADGE.RENTED}`}
                        >
                          {STATUS_LABEL.RENTED}
                        </span>
                      ) : (
                        <select
                          value={QUICK_STATUS.some((s) => s.value === v.status) ? v.status : ''}
                          onChange={(e) =>
                            statusMutation.mutate({ id: v.id, status: e.target.value })
                          }
                          disabled={statusMutation.isPending}
                          className={`cursor-pointer rounded-md border-0 px-2 py-1 text-xs font-medium ring-1 ring-ink-100 focus:ring-2 focus:ring-brand-primary ${
                            STATUS_BADGE[v.status] || ''
                          }`}
                        >
                          {QUICK_STATUS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setHistoryVehicle(v)}
                          title="Lịch sử booking"
                          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-primary"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/vehicles/${v.id}`)}
                          title="Sửa"
                          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(v)}
                          title="Ngừng sử dụng"
                          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-danger/5 hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
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

      <BookingHistoryModal vehicle={historyVehicle} onClose={() => setHistoryVehicle(null)} />
    </div>
  );
}
