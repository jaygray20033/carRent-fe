// src/pages/enterprise/SchedulePage.jsx
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { enterpriseService } from '../../services/enterpriseService.js';
import Loading from '../../components/common/Loading.jsx';
import { formatCurrency, formatDateTime } from '../../utils/format.js';

const STATUS_COLOR = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  DISPATCHED: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  DRIVER_ASSIGNED: 'bg-teal-100 text-teal-800 border-teal-200',
  IN_PROGRESS: 'bg-sky-100 text-sky-800 border-sky-200',
  PENDING_CONFIRM: 'bg-violet-100 text-violet-800 border-violet-200',
  CONFIRMED: 'bg-ink-100 text-ink-700 border-ink-200',
  SETTLED: 'bg-ink-50 text-ink-500 border-ink-100',
  CANCELLED: 'bg-red-50 text-red-600 border-red-100',
};

export default function EnterpriseSchedulePage() {
  const { isAdmin } = useOutletContext() || {};
  const qc = useQueryClient();
  const [view, setView] = useState('list'); // list | calendar
  const [selected, setSelected] = useState(null);
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterHasVas, setFilterHasVas] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['enterprise', 'bookings'],
    queryFn: () => enterpriseService.listBookings({ size: 100 }),
  });
  const items = useMemo(() => {
    const raw = data?.data ?? data ?? {};
    return Array.isArray(raw) ? raw : raw.items || [];
  }, [data]);

  const filtered = useMemo(() => {
    return items.filter((b) => {
      if (filterVehicle && b.vehicleType !== filterVehicle) return false;
      if (filterStatus && b.status !== filterStatus) return false;
      if (filterHasVas && !(b.bookingVAS?.length || b.bookingVas?.length)) return false;
      return true;
    });
  }, [items, filterVehicle, filterStatus, filterHasVas]);

  const pendingCount = useMemo(
    () => items.filter((b) => b.status === 'PENDING').length,
    [items]
  );

  const syncSelected = (booking) => {
    setSelected(booking);
    setRejectOpen(false);
    setRejectReason('');
  };

  const approveMut = useMutation({
    mutationFn: (id) => enterpriseService.approveBooking(id, {}),
    onSuccess: (res) => {
      const booking = (res?.data ?? res)?.booking || res?.data || res;
      toast.success(`Đã duyệt chuyến #${booking?.id || selected?.id}`);
      qc.invalidateQueries({ queryKey: ['enterprise', 'bookings'] });
      qc.invalidateQueries({ queryKey: ['enterprise', 'dashboard'] });
      if (booking?.id) syncSelected(booking);
    },
    onError: (err) => {
      const fieldMsg = Array.isArray(err?.errors)
        ? err.errors.map((e) => e.message).filter(Boolean).join('; ')
        : '';
      toast.error(fieldMsg || err?.message || 'Không duyệt được chuyến');
    },
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }) => enterpriseService.rejectBooking(id, { reason }),
    onSuccess: (res) => {
      const booking = (res?.data ?? res)?.booking || res?.data || res;
      toast.success(`Đã từ chối chuyến #${booking?.id || selected?.id}`);
      qc.invalidateQueries({ queryKey: ['enterprise', 'bookings'] });
      qc.invalidateQueries({ queryKey: ['enterprise', 'dashboard'] });
      if (booking?.id) syncSelected(booking);
      setRejectOpen(false);
      setRejectReason('');
    },
    onError: (err) => {
      const fieldMsg = Array.isArray(err?.errors)
        ? err.errors.map((e) => e.message).filter(Boolean).join('; ')
        : '';
      toast.error(fieldMsg || err?.message || 'Không từ chối được chuyến');
    },
  });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-700">Lịch chuyến</h1>
          {isAdmin && pendingCount > 0 && (
            <p className="mt-1 text-sm text-amber-700">
              Có <strong>{pendingCount}</strong> chuyến đang chờ bạn duyệt
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView('list')}
            className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${
              view === 'list' ? 'bg-brand-primary text-white' : 'bg-ink-100'
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setView('calendar')}
            className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${
              view === 'calendar' ? 'bg-brand-primary text-white' : 'bg-ink-100'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm"
          value={filterVehicle}
          onChange={(e) => setFilterVehicle(e.target.value)}
        >
          <option value="">Mọi loại xe</option>
          <option value="4_5_seat">4-5 chỗ</option>
          <option value="7_seat">7 chỗ</option>
          <option value="16_seat">16 chỗ</option>
          <option value="29_seat">29 chỗ</option>
        </select>
        <select
          className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Mọi trạng thái</option>
          <option value="PENDING">Chờ duyệt (PENDING)</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="DISPATCHED">Đã điều xe</option>
          <option value="DRIVER_ASSIGNED">Đã gán tài xế</option>
          <option value="IN_PROGRESS">Đang chạy</option>
          <option value="PENDING_CONFIRM">Chờ xác nhận CP</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="SETTLED">Đã quyết toán</option>
          <option value="CANCELLED">Đã huỷ</option>
        </select>
        <label className="inline-flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={filterHasVas}
            onChange={(e) => setFilterHasVas(e.target.checked)}
          />
          Có VAS
        </label>
        {isAdmin && (
          <button
            type="button"
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800"
            onClick={() => setFilterStatus('PENDING')}
          >
            Chỉ chờ duyệt
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-2">
          {view === 'list' &&
            filtered.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => syncSelected(b)}
                className={`w-full rounded-2xl border p-4 text-left shadow-sm transition hover:ring-2 hover:ring-brand-primary/30 ${
                  STATUS_COLOR[b.status] || 'bg-white'
                } ${selected?.id === b.id ? 'ring-2 ring-brand-primary/40' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold">
                    #{b.id} · {b.vehicleType}
                    {b.employee?.user?.fullName ? ` · ${b.employee.user.fullName}` : ''}
                  </div>
                  <span className="text-xs font-bold">{b.status}</span>
                </div>
                <div className="mt-1 text-sm opacity-80">
                  {formatDateTime(b.pickupAt)} → {formatDateTime(b.returnAt)}
                </div>
                <div className="text-sm opacity-80">
                  {b.pickupAddress} → {b.dropoffAddress}
                </div>
              </button>
            ))}

          {view === 'calendar' && (
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink-100">
              <div className="mb-3 text-sm font-semibold text-ink-600">
                Tháng {dayjs().format('MM/YYYY')}
              </div>
              <div className="space-y-2">
                {filtered.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => syncSelected(b)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${
                      STATUS_COLOR[b.status] || ''
                    }`}
                  >
                    <span>
                      {dayjs(b.pickupAt).format('DD/MM HH:mm')} · #{b.id}
                    </span>
                    <span className="font-semibold">{b.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-ink-400 ring-1 ring-ink-100">
              Chưa có chuyến nào
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
          <h2 className="font-semibold text-ink-700">Chi tiết</h2>
          {!selected && (
            <p className="mt-2 text-sm text-ink-400">Chọn một chuyến để xem chi tiết</p>
          )}
          {selected && (
            <div className="mt-3 space-y-2 text-sm text-ink-600">
              <div>
                <strong>#{selected.id}</strong> · {selected.status}
              </div>
              <div>
                {selected.vehicleType} · {selected.rentalType} · {selected.estimatedKm} km
              </div>
              {selected.employee?.user?.fullName && (
                <div>
                  NV: {selected.employee.user.fullName}
                  {selected.employee.employeeCode ? ` (${selected.employee.employeeCode})` : ''}
                </div>
              )}
              <div>{formatDateTime(selected.pickupAt)}</div>
              <div>
                {selected.pickupAddress} → {selected.dropoffAddress}
              </div>
              {selected.purpose && <div>Mục đích: {selected.purpose}</div>}
              <div>Base: {formatCurrency(selected.basePrice || 0)}</div>
              {(selected.bookingVAS || selected.bookingVas || []).length > 0 && (
                <div>
                  VAS:{' '}
                  {(selected.bookingVAS || selected.bookingVas)
                    .map((v) => v.vas?.name || v.name || 'VAS')
                    .join(', ')}
                </div>
              )}
              {selected.rejectReason && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-red-700">
                  Lý do từ chối: {selected.rejectReason}
                </div>
              )}

              {isAdmin && selected.status === 'PENDING' && (
                <div className="mt-4 space-y-2 border-t border-ink-100 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    Duyệt yêu cầu
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-testid="approve-booking"
                      disabled={approveMut.isPending || rejectMut.isPending}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      onClick={() => approveMut.mutate(selected.id)}
                    >
                      {approveMut.isPending ? 'Đang duyệt...' : 'Duyệt chuyến'}
                    </button>
                    <button
                      type="button"
                      data-testid="reject-booking"
                      disabled={approveMut.isPending || rejectMut.isPending}
                      className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 disabled:opacity-60"
                      onClick={() => setRejectOpen((v) => !v)}
                    >
                      Từ chối
                    </button>
                  </div>
                  {rejectOpen && (
                    <div className="space-y-2 rounded-xl bg-red-50/60 p-3 ring-1 ring-red-100">
                      <label className="block text-sm">
                        Lý do từ chối
                        <textarea
                          className="mt-1 w-full rounded-lg border border-red-200 px-3 py-2 text-sm"
                          rows={3}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="VD: Trùng lịch / không đúng mục đích công tác"
                        />
                      </label>
                      <button
                        type="button"
                        disabled={!rejectReason.trim() || rejectMut.isPending}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        onClick={() =>
                          rejectMut.mutate({
                            id: selected.id,
                            reason: rejectReason.trim(),
                          })
                        }
                      >
                        {rejectMut.isPending ? 'Đang gửi...' : 'Xác nhận từ chối'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
