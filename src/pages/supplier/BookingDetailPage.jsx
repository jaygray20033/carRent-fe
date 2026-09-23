// src/pages/supplier/BookingDetailPage.jsx
// Supplier ops on a single dispatched booking. White-label: no corporate identity,
// no margin. Supplier Admin assigns/reassigns a driver or rejects; the assigned
// driver (or admin) starts once CarGoGo releases driver info, then completes.
import { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Play,
  CheckCircle2,
  XCircle,
  Receipt,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  supplierPortalService,
  BOOKING_STATUS_LABEL,
  TRIP_EXPENSE_TYPE_LABEL,
  TRIP_EXPENSE_TYPES,
} from '../../services/supplierService.js';
import { formatDateTime, formatCurrency } from '../../utils/format.js';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';

const unwrap = (res) => res?.data ?? res ?? {};

export default function SupplierBookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useOutletContext() || {};

  const [assignOpen, setAssignOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleNote, setVehicleNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actualKm, setActualKm] = useState('');
  const [expenseType, setExpenseType] = useState('TOLL_ROAD');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');

  const { data: bookingRes, isLoading } = useQuery({
    queryKey: ['supplier', 'booking', id],
    queryFn: () => supplierPortalService.getBooking(id),
    enabled: !!id,
    // Poll while waiting on CarGoGo to release driver info, so the "Bắt đầu
    // chuyến" button un-locks without a manual refresh.
    refetchInterval: (query) => {
      const b = unwrap(query.state.data)?.booking || unwrap(query.state.data);
      return b?.status === 'DRIVER_ASSIGNED' && !b?.driverInfoReleasedAt ? 8000 : false;
    },
  });
  const { data: membersRes } = useQuery({
    queryKey: ['supplier', 'members'],
    queryFn: () => supplierPortalService.listMembers(),
    enabled: isAdmin,
  });

  const booking = unwrap(bookingRes)?.booking || unwrap(bookingRes);
  const members = (() => {
    const p = unwrap(membersRes);
    const list = Array.isArray(p) ? p : p.items || [];
    return list.filter((m) => m.isActive && m.userId);
  })();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['supplier', 'booking', id] });
    queryClient.invalidateQueries({ queryKey: ['supplier', 'bookings'] });
  };

  const assignMut = useMutation({
    mutationFn: () =>
      supplierPortalService.assignDriver(id, {
        memberId: Number(memberId),
        licensePlate: licensePlate || undefined,
        vehicleNote: vehicleNote || undefined,
      }),
    onSuccess: () => {
      toast.success('Đã phân công tài xế');
      setAssignOpen(false);
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể phân công'),
  });

  const rejectMut = useMutation({
    mutationFn: () => supplierPortalService.reject(id, { reason: rejectReason }),
    onSuccess: () => {
      toast.success('Đã từ chối chuyến');
      setRejectOpen(false);
      navigate('/supplier/bookings');
    },
    onError: (e) => toast.error(e?.message || 'Không thể từ chối'),
  });

  const startMut = useMutation({
    mutationFn: () => supplierPortalService.start(id),
    onSuccess: () => {
      toast.success('Chuyến đã bắt đầu');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể bắt đầu chuyến'),
  });

  const completeMut = useMutation({
    mutationFn: () => supplierPortalService.complete(id, { actualKm: Number(actualKm) }),
    onSuccess: () => {
      toast.success('Đã hoàn thành chuyến');
      setCompleteOpen(false);
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể hoàn thành'),
  });

  // Trip expenses (tolls, parking, overtime…) recorded by the driver on the road.
  const { data: expenseRes } = useQuery({
    queryKey: ['supplier', 'booking', id, 'expenses'],
    queryFn: () => supplierPortalService.listExpenses(id),
    enabled: !!id,
  });
  const expenseData = unwrap(expenseRes);
  const expenses = expenseData.expenses || [];
  const expenseTotal = expenseData.expenseTotal || 0;

  const invalidateExpenses = () =>
    queryClient.invalidateQueries({ queryKey: ['supplier', 'booking', id, 'expenses'] });

  const addExpenseMut = useMutation({
    mutationFn: () =>
      supplierPortalService.addExpense(id, {
        type: expenseType,
        amount: Number(expenseAmount),
        description: expenseDesc || undefined,
      }),
    onSuccess: () => {
      toast.success('Đã ghi chi phí');
      setExpenseAmount('');
      setExpenseDesc('');
      invalidateExpenses();
    },
    onError: (e) => toast.error(e?.message || 'Không thể ghi chi phí'),
  });

  const deleteExpenseMut = useMutation({
    mutationFn: (expenseId) => supplierPortalService.deleteExpense(id, expenseId),
    onSuccess: () => {
      toast.success('Đã xoá chi phí');
      invalidateExpenses();
    },
    onError: (e) => toast.error(e?.message || 'Không thể xoá chi phí'),
  });

  if (isLoading) return <Loading />;
  if (!booking?.id) return <EmptyState title="Không tìm thấy chuyến" />;

  const canAssign = isAdmin && ['DISPATCHED', 'DRIVER_ASSIGNED'].includes(booking.status);
  const canReject = isAdmin && booking.status === 'DISPATCHED';
  const canStart = ['DRIVER_ASSIGNED', 'APPROVED'].includes(booking.status);
  const canComplete = booking.status === 'IN_PROGRESS';
  const awaitingRelease =
    booking.status === 'DRIVER_ASSIGNED' && !booking.driverInfoReleasedAt;
  // Driver can log tolls/parking/etc. while running or awaiting cost confirmation.
  const canLogExpenses = ['IN_PROGRESS', 'PENDING_CONFIRM'].includes(booking.status);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/supplier/bookings')}
        className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" /> Danh sách chuyến
      </button>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-ink-700">Chuyến #{booking.id}</h1>
          <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-600">
            {BOOKING_STATUS_LABEL[booking.status] || booking.status}
          </span>
        </div>

        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-brand-primary" />
            <div>
              <div className="text-ink-400">Điểm đón</div>
              <div className="font-medium text-ink-700">{booking.pickupAddress}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-emerald-600" />
            <div>
              <div className="text-ink-400">Điểm trả</div>
              <div className="font-medium text-ink-700">{booking.dropoffAddress}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 text-ink-400" />
            <div>
              <div className="text-ink-400">Nhận xe</div>
              <div className="font-medium text-ink-700">{formatDateTime(booking.pickupAt)}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 text-ink-400" />
            <div>
              <div className="text-ink-400">Trả xe</div>
              <div className="font-medium text-ink-700">{formatDateTime(booking.returnAt)}</div>
            </div>
          </div>
          <div>
            <div className="text-ink-400">Loại xe</div>
            <div className="font-medium text-ink-700">{booking.vehicleType}</div>
          </div>
          <div>
            <div className="text-ink-400">Hình thức</div>
            <div className="font-medium text-ink-700">{booking.rentalType}</div>
          </div>
          {booking.estimatedKm != null && (
            <div>
              <div className="text-ink-400">Số km dự kiến</div>
              <div className="font-medium text-ink-700">{booking.estimatedKm} km</div>
            </div>
          )}
          {booking.supplierMember && (
            <div className="flex items-start gap-2">
              <User className="mt-0.5 h-4 w-4 text-ink-400" />
              <div>
                <div className="text-ink-400">Tài xế được phân</div>
                <div className="font-medium text-ink-700">
                  {booking.supplierMember.fullName ||
                    booking.supplierMember.user?.fullName ||
                    '—'}
                </div>
              </div>
            </div>
          )}
        </div>

        {booking.supplierVehicleNote && (
          <div className="mt-3 rounded-xl bg-ink-50 p-3 text-sm text-ink-600">
            {booking.supplierVehicleNote}
          </div>
        )}

        {awaitingRelease && (
          <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            Đã phân tài xế — đang chờ CarGoGo chuyển thông tin cho khách trước khi có thể bắt đầu
            chuyến.
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {canAssign && (
          <Button variant="primary" leftIcon={<User className="h-4 w-4" />} onClick={() => setAssignOpen(true)}>
            {booking.supplierMemberId ? 'Đổi tài xế' : 'Phân công tài xế'}
          </Button>
        )}
        {canStart && (
          <Button
            variant="accent"
            leftIcon={<Play className="h-4 w-4" />}
            loading={startMut.isPending}
            disabled={awaitingRelease}
            onClick={() => startMut.mutate()}
          >
            Bắt đầu chuyến
          </Button>
        )}
        {canComplete && (
          <Button
            variant="accent"
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
            onClick={() => setCompleteOpen(true)}
          >
            Hoàn thành chuyến
          </Button>
        )}
        {canReject && (
          <Button variant="danger" leftIcon={<XCircle className="h-4 w-4" />} onClick={() => setRejectOpen(true)}>
            Từ chối chuyến
          </Button>
        )}
      </div>

      {/* Trip expense log — driver records tolls, parking, overtime… on the road */}
      {(canLogExpenses || expenses.length > 0) && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
              <Receipt className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink-700">
                Chi phí dọc đường
              </h2>
              <p className="text-xs text-ink-400">
                Ghi lại phí cầu đường, gửi xe, tăng ca… phát sinh trong chuyến.
              </p>
            </div>
          </div>

          {expenses.length === 0 ? (
            <p className="rounded-xl bg-ink-50 p-3 text-sm text-ink-400">
              Chưa ghi khoản chi phí nào.
            </p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {expenses.map((ex) => (
                <li key={ex.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink-700">
                        {TRIP_EXPENSE_TYPE_LABEL[ex.type] || ex.type}
                      </span>
                      {ex.approvedByAdmin === true && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          Đã duyệt
                        </span>
                      )}
                      {ex.approvedByAdmin === false && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                          Bị từ chối
                        </span>
                      )}
                      {ex.approvedByAdmin == null && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          Chờ duyệt
                        </span>
                      )}
                    </div>
                    {ex.description && (
                      <p className="truncate text-xs text-ink-400">{ex.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold text-ink-700">
                      {formatCurrency(ex.amount)}
                    </span>
                    {canLogExpenses && ex.approvedByAdmin !== true && (
                      <button
                        type="button"
                        title="Xoá khoản chi phí"
                        onClick={() => deleteExpenseMut.mutate(ex.id)}
                        disabled={deleteExpenseMut.isPending}
                        className="text-ink-300 hover:text-red-500 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
              <li className="flex items-center justify-between pt-3 text-sm font-semibold text-ink-700">
                <span>Tổng chi phí</span>
                <span>{formatCurrency(expenseTotal)}</span>
              </li>
            </ul>
          )}

          {canLogExpenses && (
            <div className="mt-4 grid gap-3 border-t border-ink-100 pt-4 sm:grid-cols-2">
              <Select
                label="Loại chi phí"
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value)}
                options={TRIP_EXPENSE_TYPES.map((t) => ({
                  value: t,
                  label: TRIP_EXPENSE_TYPE_LABEL[t],
                }))}
              />
              <Input
                label="Số tiền (VND)"
                type="number"
                min="1"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="VD: 35000"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Ghi chú (tuỳ chọn)"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="VD: Trạm thu phí Long Thành"
                />
              </div>
              <div className="sm:col-span-2">
                <Button
                  variant="primary"
                  leftIcon={<Plus className="h-4 w-4" />}
                  loading={addExpenseMut.isPending}
                  disabled={!expenseAmount || Number(expenseAmount) <= 0}
                  onClick={() => addExpenseMut.mutate()}
                >
                  Thêm chi phí
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assign-driver modal */}
      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Phân công tài xế">
        <div className="space-y-4">
          <Select
            label="Tài xế"
            placeholder="Chọn tài xế"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            options={members.map((m) => ({
              value: String(m.id),
              label: `${m.fullName || m.user?.fullName || 'Tài xế'} · ${m.user?.phone || ''}`,
            }))}
          />
          {members.length === 0 && (
            <p className="text-xs text-amber-700">
              Chưa có tài xế nào được kích hoạt. Mời tài xế ở mục "Tài xế & thành viên".
            </p>
          )}
          <Input
            label="Biển số xe (tuỳ chọn)"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            placeholder="VD: 51K-123.45"
          />
          <Input
            label="Ghi chú xe (tuỳ chọn)"
            value={vehicleNote}
            onChange={(e) => setVehicleNote(e.target.value)}
            placeholder="VD: Toyota Vios trắng"
          />
          <div className="flex gap-3">
            <Button
              variant="primary"
              loading={assignMut.isPending}
              disabled={!memberId}
              onClick={() => assignMut.mutate()}
            >
              Xác nhận
            </Button>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Huỷ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject modal */}
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Từ chối chuyến">
        <div className="space-y-4">
          <Input
            label="Lý do từ chối"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do…"
          />
          <div className="flex gap-3">
            <Button
              variant="danger"
              loading={rejectMut.isPending}
              disabled={!rejectReason.trim()}
              onClick={() => rejectMut.mutate()}
            >
              Từ chối
            </Button>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Huỷ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Complete modal */}
      <Modal open={completeOpen} onClose={() => setCompleteOpen(false)} title="Hoàn thành chuyến">
        <div className="space-y-4">
          <Input
            label="Số km thực tế"
            type="number"
            min="1"
            value={actualKm}
            onChange={(e) => setActualKm(e.target.value)}
            placeholder="VD: 42"
          />
          <div className="flex gap-3">
            <Button
              variant="accent"
              loading={completeMut.isPending}
              disabled={!actualKm || Number(actualKm) <= 0}
              onClick={() => completeMut.mutate()}
            >
              Xác nhận hoàn thành
            </Button>
            <Button variant="outline" onClick={() => setCompleteOpen(false)}>
              Huỷ
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
