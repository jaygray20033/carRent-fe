// src/pages/admin/corporate/BookingQueuePage.jsx
// B2B Day 7 UC-72 + Marketplace Phase B — queue booking APPROVED chờ assign/dispatch (poll 30s).
// CarGoGo Admin: gán tài xế (self-fulfill) HOẶC dispatch cho supplier → recall → release-driver-info.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ClipboardList, PlayCircle, UserPlus, Send, Undo2, IdCard, CheckCircle2, Receipt } from 'lucide-react';
import { adminCorporateService } from '../../../services/adminService.js';
import { adminSupplierService } from '../../../services/supplierService.js';
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

const parseReleased = (b) => {
  if (!b?.releasedDriverInfo) return null;
  if (typeof b.releasedDriverInfo === 'object') return b.releasedDriverInfo;
  try {
    return JSON.parse(b.releasedDriverInfo);
  } catch {
    return null;
  }
};

const STATUS_OPTIONS = [
  { value: 'APPROVED', label: 'Chờ gán TX / dispatch (APPROVED)' },
  { value: 'DISPATCHED', label: 'Đã điều phối (DISPATCHED)' },
  { value: 'DRIVER_ASSIGNED', label: 'Supplier đã gán TX (DRIVER_ASSIGNED)' },
  { value: 'PENDING', label: 'Chờ duyệt DN (PENDING)' },
  { value: 'IN_PROGRESS', label: 'Đang chạy' },
  { value: 'PENDING_CONFIRM', label: 'Chờ confirm' },
  { value: 'CONFIRMED', label: 'Đã confirm' },
  { value: '', label: 'Tất cả' },
];

export default function BookingQueuePage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [status, setStatus] = useState('APPROVED');
  const [driverId, setDriverId] = useState('');
  const [assigningId, setAssigningId] = useState(null);
  // Marketplace inline forms: which booking row has dispatch / release open.
  const [dispatchingId, setDispatchingId] = useState(null);
  const [dispatchSupplierId, setDispatchSupplierId] = useState('');
  const [dispatchNote, setDispatchNote] = useState('');

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

  // Active suppliers to pick from when dispatching.
  const { data: supplierData } = useQuery({
    queryKey: ['adminSuppliers', 'active'],
    queryFn: () => adminSupplierService.list({ isActive: 'true', size: 100 }),
    staleTime: 5 * 60_000,
  });
  const suppliers = listOf(supplierData);
  const supplierOptions = [
    { value: '', label: '— Chọn nhà cung cấp —' },
    ...suppliers.map((s) => ({ value: String(s.id), label: s.name })),
  ];

  const list = listOf(data);

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['adminCorporateBookingQueue'] });

  const assignMut = useMutation({
    mutationFn: ({ id, driverId: dId }) =>
      adminCorporateService.assignDriver(id, { driverId: Number(dId) }),
    onSuccess: () => {
      toast.success('Đã phân công tài xế');
      setAssigningId(null);
      setDriverId('');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Assign thất bại'),
  });

  const startMut = useMutation({
    mutationFn: (id) => adminCorporateService.startBooking(id),
    onSuccess: () => {
      toast.success('Chuyến đã IN_PROGRESS');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Start thất bại'),
  });

  const dispatchMut = useMutation({
    mutationFn: ({ id, supplierId, note }) =>
      adminCorporateService.dispatch(id, { supplierId: Number(supplierId), note: note || undefined }),
    onSuccess: () => {
      toast.success('Đã điều phối cho nhà cung cấp');
      setDispatchingId(null);
      setDispatchSupplierId('');
      setDispatchNote('');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Dispatch thất bại'),
  });

  const recallMut = useMutation({
    mutationFn: (id) => adminCorporateService.recall(id, {}),
    onSuccess: () => {
      toast.success('Đã thu hồi chuyến về CarGoGo');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Recall thất bại'),
  });

  const releaseMut = useMutation({
    mutationFn: (id) => adminCorporateService.releaseDriverInfo(id, {}),
    onSuccess: () => {
      toast.success('Đã chuyển thông tin tài xế cho doanh nghiệp');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Release thất bại'),
  });

  // Final OtoRent sign-off once the company has CONFIRMED (locks the trip for settlement).
  const confirmOtorentMut = useMutation({
    mutationFn: (id) => adminCorporateService.confirmOtorent(id),
    onSuccess: () => {
      toast.success('OtoRent đã chốt chuyến');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Chốt chuyến thất bại'),
  });

  // Quick settle: turn one locked CONFIRMED booking straight into a DRAFT settlement,
  // then jump to the company's detail page (where settlements are sent / marked paid)
  // so the admin doesn't have to wait for a monthly close.
  const quickSettleMut = useMutation({
    mutationFn: (id) => adminCorporateService.quickSettlement(id),
    onSuccess: (res) => {
      const settlement = res?.data?.settlement ?? res?.settlement;
      toast.success('Đã tạo bảng kê cho chuyến');
      invalidate();
      if (settlement?.corporateId) navigate(`/admin/corporate/clients/${settlement.corporateId}`);
    },
    onError: (e) => toast.error(e?.message || 'Tạo bảng kê thất bại'),
  });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-700">Queue booking B2B</h1>
          <p className="text-sm text-ink-400">
            Gán tài xế / dispatch supplier / start chuyến · auto-refresh 30s
            {isFetching ? ' · đang cập nhật…' : ''}
          </p>
        </div>
        <div className="w-72">
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
          {list.map((b) => {
            const released = parseReleased(b);
            const isDispatched = ['DISPATCHED', 'DRIVER_ASSIGNED'].includes(b.status);
            const canDispatch = ['APPROVED', 'DISPATCHED', 'DRIVER_ASSIGNED'].includes(b.status);
            const canRecall = isDispatched;
            // Release only makes sense once supplier assigned a driver and not yet released.
            const canRelease = b.status === 'DRIVER_ASSIGNED' && !b.driverInfoReleasedAt;
            return (
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
                    {/* Supplier the booking is dispatched to (CarGoGo-internal, never shown to DN). */}
                    {b.supplier?.name && (
                      <div className="mt-1 text-xs font-medium text-indigo-600">
                        NCC: {b.supplier.name}
                        {b.supplierMember?.fullName || b.supplierMember?.user?.fullName
                          ? ` · TX: ${b.supplierMember.fullName || b.supplierMember.user.fullName}`
                          : ''}
                      </div>
                    )}
                    {released && (
                      <div className="mt-1 text-xs text-emerald-600">
                        Đã chuyển DN: {released.fullName} · {released.phone}
                        {released.licensePlate ? ` · ${released.licensePlate}` : ''}
                      </div>
                    )}
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

                {/* DRIVER_ASSIGNED but not yet released → nudge admin to relay to DN. */}
                {canRelease && (
                  <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Supplier đã gán tài xế — cần chuyển thông tin cho doanh nghiệp.
                  </div>
                )}

                {/* CONFIRMED + CarGoGo sign-off + not yet settled → locked, waiting for settlement. */}
                {b.status === 'CONFIRMED' && b.confirmedByOtorent && !b.settlementId && (
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Đã chốt, chờ quyết toán
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {/* Self-fulfill driver assignment (CarGoGo fleet). */}
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
                      onClick={() => {
                        setAssigningId(b.id);
                        setDispatchingId(null);
                      }}
                      disabled={['IN_PROGRESS', 'CONFIRMED', 'SETTLED', 'CANCELLED'].includes(b.status)}
                    >
                      <UserPlus className="h-4 w-4" /> Gán tài xế (CarGoGo)
                    </button>
                  )}

                  {/* Marketplace: dispatch to a supplier. */}
                  {canDispatch &&
                    (dispatchingId === b.id ? (
                      <>
                        <div className="w-56">
                          <Select
                            value={dispatchSupplierId}
                            onChange={(e) => setDispatchSupplierId(e.target.value)}
                            options={supplierOptions}
                          />
                        </div>
                        <Input
                          value={dispatchNote}
                          onChange={(e) => setDispatchNote(e.target.value)}
                          placeholder="Ghi chú (tuỳ chọn)"
                          className="w-48"
                        />
                        <button
                          type="button"
                          className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white"
                          disabled={!dispatchSupplierId || dispatchMut.isPending}
                          onClick={() =>
                            dispatchMut.mutate({
                              id: b.id,
                              supplierId: dispatchSupplierId,
                              note: dispatchNote,
                            })
                          }
                        >
                          {b.supplierId ? 'Điều phối lại' : 'Điều phối'}
                        </button>
                        <button
                          type="button"
                          className="rounded-xl px-3 py-2 text-sm text-ink-400"
                          onClick={() => setDispatchingId(null)}
                        >
                          Huỷ
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                        onClick={() => {
                          setDispatchingId(b.id);
                          setAssigningId(null);
                          setDispatchSupplierId(b.supplierId ? String(b.supplierId) : '');
                          setDispatchNote('');
                        }}
                      >
                        <Send className="h-4 w-4" /> {b.supplierId ? 'Điều phối lại' : 'Điều phối NCC'}
                      </button>
                    ))}

                  {/* Recall a dispatched booking back to CarGoGo. */}
                  {canRecall && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
                      disabled={recallMut.isPending}
                      onClick={() => recallMut.mutate(b.id)}
                    >
                      <Undo2 className="h-4 w-4" /> Thu hồi
                    </button>
                  )}

                  {/* Relay supplier-assigned driver info to the company. */}
                  {canRelease && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                      disabled={releaseMut.isPending}
                      onClick={() => releaseMut.mutate(b.id)}
                    >
                      <IdCard className="h-4 w-4" /> Chuyển thông tin TX cho DN
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

                  {/* Final CarGoGo sign-off: company has CONFIRMED, CarGoGo chốt to lock for settlement. */}
                  {b.status === 'CONFIRMED' && b.confirmedByCorporateAdmin && !b.confirmedByOtorent && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-xl bg-brand-primary px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                      disabled={confirmOtorentMut.isPending}
                      onClick={() => confirmOtorentMut.mutate(b.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Chốt chuyến (CarGoGo)
                    </button>
                  )}

                  {/* Quick settle: one locked CONFIRMED booking → its own DRAFT settlement. */}
                  {b.status === 'CONFIRMED' && b.confirmedByOtorent && !b.settlementId && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                      disabled={quickSettleMut.isPending}
                      onClick={() => quickSettleMut.mutate(b.id)}
                    >
                      <Receipt className="h-4 w-4" /> Quyết toán ngay chuyến này
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
