// src/pages/admin/SosRequestListPage.jsx
// Day 39 (UC-35/36) — operator SOS dispatch queue.
// Status tabs, detail/dispatch modal (assign driver + ETA, advance status),
// and optional replacement-booking action. ADMIN/OPERATOR only.
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, MapPin, Truck, Phone, Car, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminSosService } from '../../services/sosService.js';
import { formatDateTime } from '../../utils/format.js';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';

const PAGE_SIZE = 20;

const STATUS_TABS = [
  { value: 'REQUESTED', label: 'Mới tiếp nhận' },
  { value: 'DISPATCHED', label: 'Đã điều động' },
  { value: 'ON_THE_WAY', label: 'Đang trên đường' },
  { value: 'RESOLVED', label: 'Đã hoàn tất' },
  { value: '', label: 'Tất cả' },
];

const STATUS_META = {
  REQUESTED: { label: 'Mới tiếp nhận', variant: 'warning' },
  DISPATCHED: { label: 'Đã điều động', variant: 'info' },
  ON_THE_WAY: { label: 'Đang trên đường', variant: 'info' },
  RESOLVED: { label: 'Đã hoàn tất', variant: 'success' },
  CANCELLED: { label: 'Đã huỷ', variant: 'danger' },
};

const ISSUE_LABEL = {
  FLAT_TIRE: 'Thủng / xịt lốp',
  DEAD_BATTERY: 'Hết / yếu ắc quy',
  OUT_OF_FUEL: 'Hết nhiên liệu',
  ENGINE: 'Lỗi động cơ',
  ACCIDENT: 'Tai nạn / va chạm',
  LOCKED_OUT: 'Kẹt khóa / mất chìa',
  OTHER: 'Sự cố khác',
};

// Allowed next status per current status (server enforces; UI mirrors it).
const NEXT_STATUS = {
  REQUESTED: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['ON_THE_WAY', 'CANCELLED'],
  ON_THE_WAY: ['RESOLVED', 'CANCELLED'],
};

export default function SosRequestListPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('REQUESTED');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminSosRequests', status, page],
    queryFn: () =>
      adminSosService.list({ page, size: PAGE_SIZE, ...(status ? { status } : {}) }),
    keepPreviousData: true,
  });

  const payload = data?.data ?? data ?? {};
  const list = Array.isArray(payload) ? payload : payload.items || [];
  const total = data?.meta?.total ?? payload.total ?? list.length;
  const totalPages = data?.meta?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleTab = (value) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div>
      <h1 className="mb-5 text-xl font-bold text-ink-700">Yêu cầu cứu hộ (SOS)</h1>

      {/* Status tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTab(tab.value)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              status === tab.value
                ? 'bg-brand-primary text-white'
                : 'bg-white text-ink-500 ring-1 ring-ink-100 hover:bg-ink-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
        {isLoading ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : list.length === 0 ? (
          <div className="p-8">
            <EmptyState title="Chưa có yêu cầu" description="Không có yêu cầu nào ở trạng thái này." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isFetching ? 'opacity-60' : ''}`}>
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase text-ink-300">
                  <th className="px-4 py-3 font-medium">Đơn / Khách</th>
                  <th className="px-4 py-3 font-medium">Sự cố</th>
                  <th className="px-4 py-3 font-medium">Trạm gần nhất</th>
                  <th className="px-4 py-3 font-medium">Gửi lúc</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => {
                  const meta = STATUS_META[r.status] || STATUS_META.REQUESTED;
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink-700">
                          {r.booking?.bookingCode || `#${r.bookingId}`}
                        </p>
                        <p className="text-xs text-ink-400">
                          {r.user?.fullName || '—'} · {r.user?.phone || r.user?.email || ''}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-ink-500">
                        {ISSUE_LABEL[r.issueType] || r.issueType}
                      </td>
                      <td className="px-4 py-3 text-ink-500">
                        {r.rescueStation?.name || '—'}
                        {r.distanceKm != null && (
                          <span className="text-xs text-ink-400"> ({r.distanceKm.toFixed(1)} km)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-ink-500">
                        {formatDateTime(r.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => setSelected(r)}
                            title="Xem & xử lý"
                            className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-primary"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {selected && (
        <DispatchModal
          requestId={selected.id}
          onClose={() => setSelected(null)}
          onDone={() => {
            queryClient.invalidateQueries({ queryKey: ['adminSosRequests'] });
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

function DispatchModal({ requestId, onClose, onDone }) {
  const queryClient = useQueryClient();
  const [showReplacement, setShowReplacement] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['adminSosRequest', requestId],
    queryFn: () => adminSosService.detail(requestId),
  });
  const req = data?.data?.sosRequest ?? data?.data?.request ?? data?.data ?? null;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const nextStatus = watch('status');

  const updateMutation = useMutation({
    mutationFn: (body) => adminSosService.update(requestId, body),
    onSuccess: () => {
      toast.success('Đã cập nhật yêu cầu cứu hộ');
      queryClient.invalidateQueries({ queryKey: ['adminSosRequest', requestId] });
      onDone();
    },
    onError: (e) => toast.error(e?.message || 'Cập nhật thất bại'),
  });

  const onSubmit = (values) => {
    const body = { status: values.status };
    if (values.driverName?.trim()) body.driverName = values.driverName.trim();
    if (values.driverPhone?.trim()) body.driverPhone = values.driverPhone.trim();
    if (values.etaMinutes) body.etaMinutes = Number(values.etaMinutes);
    if (values.resolutionNote?.trim()) body.resolutionNote = values.resolutionNote.trim();
    updateMutation.mutate(body);
  };

  const meta = req ? STATUS_META[req.status] || STATUS_META.REQUESTED : null;
  const options = req ? NEXT_STATUS[req.status] || [] : [];
  const isOpen = req && ['REQUESTED', 'DISPATCHED', 'ON_THE_WAY'].includes(req.status);
  const photos = parsePhotos(req?.photos);

  return (
    <Modal open onClose={onClose} title="Xử lý yêu cầu cứu hộ" size="lg">
      {isLoading || !req ? (
        <div className="py-8">
          <Loading />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-ink-900">
                {req.booking?.bookingCode || `#${req.bookingId}`}
              </p>
              <p className="text-sm text-ink-500">
                {ISSUE_LABEL[req.issueType] || req.issueType}
              </p>
            </div>
            <Badge variant={meta.variant}>{meta.label}</Badge>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Khách hàng" value={req.user?.fullName} />
            <Field
              label="Liên hệ"
              value={[req.user?.phone, req.user?.email].filter(Boolean).join(' · ')}
            />
            <Field
              label="Trạm cứu hộ gần nhất"
              value={
                req.rescueStation
                  ? `${req.rescueStation.name}${req.distanceKm != null ? ` — ${req.distanceKm.toFixed(1)} km` : ''}`
                  : '—'
              }
            />
            {req.estimatedArrival && (
              <Field label="Dự kiến đến" value={formatDateTime(req.estimatedArrival)} />
            )}
          </div>

          {req.description && <Field label="Mô tả" value={req.description} multiline />}

          {/* Location link */}
          <a
            href={`https://www.google.com/maps?q=${req.latitude},${req.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-brand-primary hover:underline"
          >
            <MapPin className="h-4 w-4" />
            Xem vị trí trên bản đồ
            <ExternalLink className="h-3 w-3" />
          </a>

          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {photos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={url}
                    alt={`Hiện trường ${i + 1}`}
                    className="h-20 w-20 rounded-lg object-cover ring-1 ring-ink-100"
                  />
                </a>
              ))}
            </div>
          )}

          {/* Replacement booking pointer */}
          {req.replacementBooking && (
            <div className="rounded-xl bg-success/5 p-3 text-sm text-success ring-1 ring-success/20">
              Đã tạo xe thay thế: {req.replacementBooking.bookingCode}
            </div>
          )}

          {/* Dispatch form (open requests only) */}
          {isOpen ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 border-t border-ink-100 pt-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  Cập nhật trạng thái *
                </label>
                <select
                  className="input"
                  defaultValue=""
                  {...register('status', { required: 'Vui lòng chọn trạng thái' })}
                >
                  <option value="" disabled>
                    Chọn trạng thái tiếp theo…
                  </option>
                  {options.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s]?.label || s}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-xs text-danger">{errors.status.message}</p>
                )}
              </div>

              {nextStatus === 'DISPATCHED' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label="Tài xế cứu hộ *"
                    placeholder="Trần Văn B"
                    leftIcon={<Truck className="h-4 w-4" />}
                    error={errors.driverName?.message}
                    {...register('driverName', { required: 'Nhập tên tài xế khi điều động' })}
                  />
                  <Input
                    label="SĐT tài xế"
                    placeholder="0901234567"
                    leftIcon={<Phone className="h-4 w-4" />}
                    {...register('driverPhone')}
                  />
                  <Input
                    label="Thời gian đến dự kiến (phút)"
                    type="number"
                    min={1}
                    placeholder="30"
                    {...register('etaMinutes')}
                  />
                </div>
              )}

              {nextStatus === 'RESOLVED' && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">
                    Ghi chú xử lý
                  </label>
                  <textarea
                    rows={3}
                    className="input"
                    placeholder="Đã thay lốp tại chỗ, xe tiếp tục hành trình…"
                    {...register('resolutionNote')}
                  />
                </div>
              )}

              {nextStatus === 'CANCELLED' && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">
                    Lý do huỷ
                  </label>
                  <textarea
                    rows={2}
                    className="input"
                    placeholder="Khách tự xử lý được / trùng yêu cầu…"
                    {...register('resolutionNote')}
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowReplacement((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
                >
                  <Car className="h-4 w-4" />
                  {showReplacement ? 'Ẩn xe thay thế' : 'Tạo xe thay thế'}
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={updateMutation.isPending}
                >
                  Cập nhật
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-xl bg-ink-50 p-3 text-sm">
              <span className="font-medium text-ink-700">
                Trạng thái: {meta.label}
              </span>
              {req.resolutionNote && (
                <p className="mt-1 text-ink-500">Ghi chú: {req.resolutionNote}</p>
              )}
            </div>
          )}

          {/* Replacement booking form */}
          {isOpen && showReplacement && !req.replacementBooking && (
            <ReplacementForm
              requestId={requestId}
              onDone={() => {
                queryClient.invalidateQueries({ queryKey: ['adminSosRequest', requestId] });
                onDone();
              }}
            />
          )}
        </div>
      )}
    </Modal>
  );
}

function ReplacementForm({ requestId, onDone }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const mutation = useMutation({
    mutationFn: (body) => adminSosService.createReplacement(requestId, body),
    onSuccess: () => {
      toast.success('Đã tạo đơn xe thay thế');
      onDone();
    },
    onError: (e) => toast.error(e?.message || 'Tạo xe thay thế thất bại'),
  });

  const onSubmit = (values) => {
    const body = { vehicleId: Number(values.vehicleId) };
    if (values.pickupStationId) body.pickupStationId = Number(values.pickupStationId);
    if (values.note?.trim()) body.note = values.note.trim();
    mutation.mutate(body);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 rounded-xl bg-brand-primary/5 p-4 ring-1 ring-brand-primary/20"
    >
      <p className="text-sm font-semibold text-ink-800">Tạo đơn xe thay thế</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Mã xe thay thế (Vehicle ID) *"
          type="number"
          placeholder="123"
          error={errors.vehicleId?.message}
          {...register('vehicleId', { required: 'Nhập ID xe thay thế' })}
        />
        <Input
          label="Trạm giao xe (Station ID)"
          type="number"
          placeholder="1"
          {...register('pickupStationId')}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700">Ghi chú</label>
        <textarea rows={2} className="input" {...register('note')} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="sm" loading={mutation.isPending}>
          Tạo đơn thay thế
        </Button>
      </div>
    </form>
  );
}

function parsePhotos(photos) {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos;
  try {
    const parsed = JSON.parse(photos);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function Field({ label, value, multiline }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-ink-400">{label}</p>
      <p className={`text-sm text-ink-700 ${multiline ? 'whitespace-pre-line' : ''}`}>
        {value || '—'}
      </p>
    </div>
  );
}
