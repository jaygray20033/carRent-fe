// src/pages/supplier/BookingDetailPage.jsx
// Supplier ops on a single dispatched booking. White-label: no corporate identity,
// no margin. Supplier Admin assigns/reassigns a driver or rejects; the assigned
// driver (or admin) starts once OtoRent releases driver info, then completes.
import { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Clock, User, Play, CheckCircle2, XCircle } from 'lucide-react';
import { supplierPortalService, BOOKING_STATUS_LABEL } from '../../services/supplierService.js';
import { formatDateTime } from '../../utils/format.js';
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

  const { data: bookingRes, isLoading } = useQuery({
    queryKey: ['supplier', 'booking', id],
    queryFn: () => supplierPortalService.getBooking(id),
    enabled: !!id,
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

  if (isLoading) return <Loading />;
  if (!booking?.id) return <EmptyState title="Không tìm thấy chuyến" />;

  const canAssign = isAdmin && ['DISPATCHED', 'DRIVER_ASSIGNED'].includes(booking.status);
  const canReject = isAdmin && booking.status === 'DISPATCHED';
  const canStart = ['DRIVER_ASSIGNED', 'APPROVED'].includes(booking.status);
  const canComplete = booking.status === 'IN_PROGRESS';
  const awaitingRelease =
    booking.status === 'DRIVER_ASSIGNED' && !booking.driverInfoReleasedAt;

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
            Đã phân tài xế — đang chờ OtoRent chuyển thông tin cho khách trước khi có thể bắt đầu
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
