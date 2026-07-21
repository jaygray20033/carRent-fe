// src/pages/admin/SupplierApplicationListPage.jsx
// Marketplace — admin review of supplier (nhà xe) partner applications.
// Status tabs, detail modal, approve/reject. On APPROVE the admin sets a
// commission rate; the backend creates the Supplier + SUPPLIER_ADMIN member.
// ADMIN/OPERATOR only. Mirrors AgentApplicationListPage.
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Check, X, FileText, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminSupplierApplicationService } from '../../services/partnerService.js';
import { formatDateTime } from '../../utils/format.js';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';

const PAGE_SIZE = 20;

const STATUS_TABS = [
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Đã từ chối' },
  { value: '', label: 'Tất cả' },
];

const STATUS_META = {
  PENDING: { label: 'Chờ duyệt', variant: 'warning' },
  APPROVED: { label: 'Đã duyệt', variant: 'success' },
  REJECTED: { label: 'Đã từ chối', variant: 'danger' },
};

const TYPE_LABEL = { INDIVIDUAL: 'Cá nhân', BUSINESS: 'Doanh nghiệp' };

const DEFAULT_COMMISSION = 15;

export default function SupplierApplicationListPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [commissionRate, setCommissionRate] = useState(DEFAULT_COMMISSION);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminSupplierApplications', status, page],
    queryFn: () =>
      adminSupplierApplicationService.list({ page, size: PAGE_SIZE, ...(status ? { status } : {}) }),
    keepPreviousData: true,
  });

  const payload = data?.data ?? data ?? {};
  const list = Array.isArray(payload) ? payload : payload.items || [];
  const total = data?.meta?.total ?? payload.total ?? list.length;
  const totalPages = data?.meta?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  const reviewMutation = useMutation({
    mutationFn: ({ id, ...body }) => adminSupplierApplicationService.review(id, body),
    onSuccess: (_res, vars) => {
      toast.success(vars.status === 'APPROVED' ? 'Đã duyệt và kích hoạt nhà xe' : 'Đã từ chối đơn');
      queryClient.invalidateQueries({ queryKey: ['adminSupplierApplications'] });
      closeDetail();
    },
    onError: (e) => toast.error(e?.message || 'Cập nhật thất bại'),
  });

  const handleTab = (value) => {
    setStatus(value);
    setPage(1);
  };

  const openDetail = (app) => {
    setSelected(app);
    setReviewNote(app.reviewNote || '');
    setCommissionRate(DEFAULT_COMMISSION);
  };

  const closeDetail = () => {
    setSelected(null);
    setReviewNote('');
    setCommissionRate(DEFAULT_COMMISSION);
  };

  const approve = () => {
    if (!selected) return;
    const rate = Number(commissionRate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      toast.error('Tỷ lệ hoa hồng phải từ 0 đến 100');
      return;
    }
    reviewMutation.mutate({
      id: selected.id,
      status: 'APPROVED',
      commissionRate: rate / 100, // admin enters a percentage; backend stores a fraction (0–1)
      reviewNote: reviewNote.trim(),
    });
  };

  const reject = () => {
    if (!selected) return;
    if (!reviewNote.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    reviewMutation.mutate({ id: selected.id, status: 'REJECTED', reviewNote: reviewNote.trim() });
  };

  return (
    <div>
      <h1 className="mb-5 text-xl font-bold text-ink-700">Đơn đăng ký nhà xe</h1>

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
            <EmptyState title="Chưa có đơn đăng ký" description="Không có đơn nào ở trạng thái này." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isFetching ? 'opacity-60' : ''}`}>
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase text-ink-300">
                  <th className="px-4 py-3 font-medium">Nhà xe</th>
                  <th className="px-4 py-3 font-medium">Loại</th>
                  <th className="px-4 py-3 font-medium">Gửi lúc</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((app) => {
                  const meta = STATUS_META[app.status] || STATUS_META.PENDING;
                  return (
                    <tr
                      key={app.id}
                      className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink-700">{app.companyName}</p>
                        <p className="text-xs text-ink-400">
                          {app.user?.fullName || '—'} · {app.user?.phone || app.user?.email || ''}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-ink-500">
                        {TYPE_LABEL[app.applicantType] || app.applicantType}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-ink-500">
                        {formatDateTime(app.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => openDetail(app)}
                            title="Xem chi tiết"
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

      {/* Detail + review modal */}
      <Modal open={!!selected} onClose={closeDetail} title="Chi tiết đơn đăng ký nhà xe" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Người đăng ký" value={selected.user?.fullName} />
              <Field
                label="Liên hệ tài khoản"
                value={[selected.user?.phone, selected.user?.email].filter(Boolean).join(' · ')}
              />
              <Field label="Tên nhà xe" value={selected.companyName} />
              <Field label="Loại" value={TYPE_LABEL[selected.applicantType] || selected.applicantType} />
              {selected.taxCode && <Field label="Mã số thuế" value={selected.taxCode} />}
              {selected.contactName && <Field label="Người liên hệ" value={selected.contactName} />}
              {selected.contactPhone && <Field label="SĐT liên hệ" value={selected.contactPhone} />}
              {selected.contactEmail && <Field label="Email liên hệ" value={selected.contactEmail} />}
            </div>

            <Field label="Địa chỉ" value={selected.address} />

            {selected.note && <Field label="Ghi chú" value={selected.note} multiline />}

            {selected.licenseFileUrl && (
              <div>
                <p className="text-xs font-medium uppercase text-ink-400">Giấy phép kinh doanh</p>
                <a
                  href={selected.licenseFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 text-sm text-brand-primary hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  Xem giấy tờ
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {selected.status === 'PENDING' ? (
              <>
                <div>
                  <label
                    htmlFor="commissionRate"
                    className="mb-1.5 block text-xs font-medium uppercase text-ink-400"
                  >
                    Tỷ lệ hoa hồng (%)
                  </label>
                  <input
                    id="commissionRate"
                    type="number"
                    min={0}
                    max={100}
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="input"
                  />
                  <p className="mt-1 text-xs text-ink-400">
                    Áp dụng khi duyệt — hoa hồng OtoRent thu trên mỗi đơn của nhà xe.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="reviewNote"
                    className="mb-1.5 block text-xs font-medium uppercase text-ink-400"
                  >
                    Ghi chú duyệt / lý do từ chối
                  </label>
                  <textarea
                    id="reviewNote"
                    rows={3}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Bắt buộc khi từ chối…"
                    className="input"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="ghost"
                    onClick={reject}
                    disabled={reviewMutation.isPending}
                    leftIcon={<X className="h-4 w-4" />}
                  >
                    Từ chối
                  </Button>
                  <Button
                    variant="primary"
                    onClick={approve}
                    loading={reviewMutation.isPending}
                    leftIcon={<Check className="h-4 w-4" />}
                  >
                    Duyệt & kích hoạt nhà xe
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-xl bg-ink-50 p-3 text-sm">
                <span className="font-medium text-ink-700">
                  Trạng thái: {STATUS_META[selected.status]?.label || selected.status}
                </span>
                {selected.reviewNote && (
                  <p className="mt-1 text-ink-500">Ghi chú: {selected.reviewNote}</p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
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
