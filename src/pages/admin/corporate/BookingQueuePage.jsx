// src/pages/admin/corporate/BookingQueuePage.jsx
// B2B Day 7 UC-72 — queue booking APPROVED chờ assign tài xế (poll 30s).
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ClipboardList, PlayCircle, UserPlus } from 'lucide-react';
import { adminCorporateService } from '../../../services/adminService.js';
import { formatCurrency, formatDateTime } from '../../../utils/format.js';
import Input from '../../../components/ui/Input.jsx';
import Select from '../../../components/ui/Select.jsx';
import Loading from '../../../components/common/Loading.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';

const unwrap = (res) => res?.data ?? res ?? {};
const listOf = (res) => {
  const p = unwrap(res);
  return Array.isArray(p) ? p : p.items || [];
};

const STATUS_OPTIONS = [
  { value: 'APPROVED', label: 'Chờ gán TX (APPROVED)' },
  { value: 'PENDING', label: 'Chờ duyệt DN (PENDING)' },
  { value: 'IN_PROGRESS', label: 'Đang chạy' },
  { value: 'PENDING_CONFIRM', label: 'Chờ confirm' },
  { value: 'CONFIRMED', label: 'Đã confirm' },
  { value: '', label: 'Tất cả' },
];

export default function BookingQueuePage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('APPROVED');
  const [driverId, setDriverId] = useState('');
  const [assigningId, setAssigningId] = useState(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminCorporateBookingQueue', status],
    queryFn: () =>
      adminCorporateService.listBookings({
        ...(status ? { status } : {}),
        size: 50,
      }),
    refetchInterval: 30_000,
    keepPreviousData: true,
  });

  const list = listOf(data);

  const assignMut = useMutation({
    mutationFn: ({ id, driverId: dId }) =>
      adminCorporateService.assignDriver(id, { driverId: Number(dId) }),
    onSuccess: () => {
      toast.success('Đã phân công tài xế');
      setAssigningId(null);
      setDriverId('');
      qc.invalidateQueries({ queryKey: ['adminCorporateBookingQueue'] });
    },
    onError: (e) => toast.error(e?.message || 'Assign thất bại'),
  });

  const startMut = useMutation({
    mutationFn: (id) => adminCorporateService.startBooking(id),
    onSuccess: () => {
      toast.success('Chuyến đã IN_PROGRESS');
      qc.invalidateQueries({ queryKey: ['adminCorporateBookingQueue'] });
    },
    onError: (e) => toast.error(e?.message || 'Start thất bại'),
  });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-700">Queue booking B2B</h1>
          <p className="text-sm text-ink-400">
            Gán tài xế / start chuyến · auto-refresh 30s
            {isFetching ? ' · đang cập nhật…' : ''}
          </p>
        </div>
        <div className="w-56">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState title="Không có booking trong queue" icon={ClipboardList} />
      ) : (
        <div className="space-y-3">
          {list.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink-100"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-ink-700">
                    #{b.id} · {b.corporate?.name || `Corp #${b.corporateId}`}
                  </div>
                  <div className="mt-1 text-sm text-ink-500">
                    {b.employee?.user?.fullName || 'NV'} · {b.vehicleType} · {b.rentalType} ·{' '}
                    {b.estimatedKm}km
                  </div>
                  <div className="mt-1 text-xs text-ink-300">
                    {formatDateTime?.(b.pickupAt) || String(b.pickupAt)} →{' '}
                    {String(b.returnAt).slice(0, 16)}
                  </div>
                  <div className="mt-1 text-sm">
                    {b.pickupAddress} → {b.dropoffAddress}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium uppercase text-ink-400">{b.status}</div>
                  <div className="font-semibold text-brand-primary">
                    {formatCurrency(b.basePrice)}
                  </div>
                  {b.driverId && (
                    <div className="text-xs text-ink-400">driverId: {b.driverId}</div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {assigningId === b.id ? (
                  <>
                    <Input
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value)}
                      placeholder="driver userId"
                      className="w-36"
                    />
                    <button
                      type="button"
                      className="rounded-xl bg-brand-primary px-3 py-2 text-sm font-medium text-white"
                      disabled={!driverId || assignMut.isPending}
                      onClick={() => assignMut.mutate({ id: b.id, driverId })}
                    >
                      Xác nhận
                    </button>
                    <button
                      type="button"
                      className="rounded-xl px-3 py-2 text-sm text-ink-400"
                      onClick={() => setAssigningId(null)}
                    >
                      Huỷ
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-xl bg-ink-50 px-3 py-2 text-sm text-ink-600 hover:bg-ink-100"
                    onClick={() => setAssigningId(b.id)}
                    disabled={['IN_PROGRESS', 'CONFIRMED', 'SETTLED', 'CANCELLED'].includes(b.status)}
                  >
                    <UserPlus className="h-4 w-4" /> Gán tài xế
                  </button>
                )}

                {b.status === 'APPROVED' && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                    disabled={startMut.isPending}
                    onClick={() => startMut.mutate(b.id)}
                  >
                    <PlayCircle className="h-4 w-4" /> Start
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
