// src/pages/supplier/SettlementDetailPage.jsx — payout period detail + document submission.
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, Wallet, AlertTriangle } from 'lucide-react';
import {
  supplierPortalService,
  SETTLEMENT_STATUS_LABEL,
  SETTLEMENT_STATUS_BADGE,
} from '../../services/supplierService.js';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format.js';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';

const unwrap = (res) => res?.data ?? res ?? {};

// Statuses where the Supplier Admin may (re)submit documents.
const CAN_SUBMIT = ['PENDING_DOCUMENTS', 'DOCUMENTS_REJECTED'];

export default function SupplierSettlementDetailPage() {
  const { settlementId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useOutletContext() || {};

  const { data, isLoading } = useQuery({
    queryKey: ['supplier', 'settlement', settlementId],
    queryFn: () => supplierPortalService.getSettlement(settlementId),
    enabled: !!settlementId,
  });

  const settlement = unwrap(data)?.settlement || unwrap(data);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitMutation = useMutation({
    mutationFn: (payload) => supplierPortalService.submitDocuments(settlementId, payload),
    onSuccess: () => {
      toast.success('Đã nộp hồ sơ payout');
      queryClient.invalidateQueries({ queryKey: ['supplier', 'settlement', settlementId] });
      queryClient.invalidateQueries({ queryKey: ['supplier', 'settlements'] });
    },
    onError: (err) => toast.error(err?.message || 'Nộp hồ sơ thất bại'),
  });

  if (isLoading) return <Loading />;
  if (!settlement?.id) return <EmptyState title="Không tìm thấy kỳ payout" icon={Wallet} />;

  const canSubmit = isAdmin && CAN_SUBMIT.includes(settlement.status);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/supplier/settlements')}
        className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" /> Danh sách payout
      </button>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-ink-700">
            Kỳ {formatDate(settlement.periodStart)} → {formatDate(settlement.periodEnd)}
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              SETTLEMENT_STATUS_BADGE[settlement.status] || 'bg-ink-100 text-ink-500'
            }`}
          >
            {SETTLEMENT_STATUS_LABEL[settlement.status] || settlement.status}
          </span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-ink-50 p-4">
            <div className="text-xs text-ink-400">Tổng doanh thu chuyến</div>
            <div className="text-lg font-bold text-ink-800">
              {formatCurrency(settlement.totalFinalAmount)}
            </div>
          </div>
          <div className="rounded-xl bg-ink-50 p-4">
            <div className="text-xs text-ink-400">Hoa hồng OtoRent</div>
            <div className="text-lg font-bold text-ink-800">
              − {formatCurrency(settlement.totalCommissionAmount)}
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4">
            <div className="text-xs text-emerald-600">Thực nhận (payout)</div>
            <div className="text-lg font-bold text-emerald-700">
              {formatCurrency(settlement.supplierPayout)}
            </div>
          </div>
        </div>

        {settlement.paidAt && (
          <p className="mt-3 text-sm text-emerald-700">
            Đã thanh toán {formatDateTime(settlement.paidAt)} · Mã GD:{' '}
            <span className="font-mono">{settlement.paymentReference}</span>
          </p>
        )}
      </div>

      {settlement.status === 'DOCUMENTS_REJECTED' && settlement.rejectionReason && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-semibold">OtoRent yêu cầu bổ sung hồ sơ</div>
            <div>{settlement.rejectionReason}</div>
          </div>
        </div>
      )}

      {/* Bookings in this period */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <h2 className="mb-3 font-semibold text-ink-700">
          Chuyến trong kỳ ({settlement.bookings?.length ?? 0})
        </h2>
        {!settlement.bookings?.length ? (
          <p className="text-sm text-ink-300">Không có chuyến</p>
        ) : (
          <ul className="divide-y divide-ink-50 text-sm">
            {settlement.bookings.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="text-ink-700">
                  #{b.id} · {b.pickupAddress} → {b.dropoffAddress}
                </span>
                <span className="text-ink-400">{formatDate(b.completedAt)}</span>
                <span className="font-medium">{formatCurrency(b.finalAmount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Submitted documents */}
      {settlement.vatInvoiceRef && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
          <h2 className="mb-3 font-semibold text-ink-700">Hồ sơ đã nộp</h2>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink-400">Số hoá đơn GTGT</dt>
              <dd className="font-medium text-ink-700">{settlement.vatInvoiceRef}</dd>
            </div>
            <DocLink label="Hoá đơn GTGT" url={settlement.vatInvoiceUrl} />
            <DocLink label="Bảng kê" url={settlement.statementUrl} />
            <DocLink label="Lệnh điều xe" url={settlement.dispatchRecordsUrl} />
            {settlement.supportingDocumentsUrl && (
              <DocLink label="Chứng từ khác" url={settlement.supportingDocumentsUrl} />
            )}
          </dl>
        </div>
      )}

      {/* Document submission form (Supplier Admin only, right status) */}
      {canSubmit && (
        <form
          onSubmit={handleSubmit((values) => submitMutation.mutate(values))}
          className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100"
        >
          <h2 className="font-semibold text-ink-700">Nộp hồ sơ thanh toán</h2>
          <Input
            label="Số hoá đơn GTGT *"
            placeholder="VD: HĐ-2026-000123"
            error={errors.vatInvoiceRef?.message}
            {...register('vatInvoiceRef', { required: 'Cần số hoá đơn GTGT' })}
          />
          <Input
            label="Link hoá đơn GTGT *"
            placeholder="https://…"
            error={errors.vatInvoiceUrl?.message}
            {...register('vatInvoiceUrl', {
              required: 'Cần link hoá đơn',
              pattern: { value: /^https?:\/\//i, message: 'URL không hợp lệ' },
            })}
          />
          <Input
            label="Link bảng kê chi tiết *"
            placeholder="https://…"
            error={errors.statementUrl?.message}
            {...register('statementUrl', {
              required: 'Cần link bảng kê',
              pattern: { value: /^https?:\/\//i, message: 'URL không hợp lệ' },
            })}
          />
          <Input
            label="Link lệnh điều xe (LDX) *"
            placeholder="https://…"
            error={errors.dispatchRecordsUrl?.message}
            {...register('dispatchRecordsUrl', {
              required: 'Cần link lệnh điều xe',
              pattern: { value: /^https?:\/\//i, message: 'URL không hợp lệ' },
            })}
          />
          <Input
            label="Link chứng từ khác (tuỳ chọn)"
            placeholder="https://…"
            error={errors.supportingDocumentsUrl?.message}
            {...register('supportingDocumentsUrl', {
              pattern: { value: /^https?:\/\//i, message: 'URL không hợp lệ' },
            })}
          />
          <Button type="submit" loading={submitMutation.isPending}>
            Nộp hồ sơ
          </Button>
        </form>
      )}

      {!isAdmin && CAN_SUBMIT.includes(settlement.status) && (
        <p className="rounded-2xl bg-white p-4 text-sm text-ink-500 shadow-sm ring-1 ring-ink-100">
          Chỉ Supplier Admin mới được nộp hồ sơ thanh toán.
        </p>
      )}
    </div>
  );
}

function DocLink({ label, url }) {
  if (!url) return null;
  return (
    <div>
      <dt className="text-ink-400">{label}</dt>
      <dd>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-brand-primary underline"
        >
          Mở tài liệu
        </a>
      </dd>
    </div>
  );
}
