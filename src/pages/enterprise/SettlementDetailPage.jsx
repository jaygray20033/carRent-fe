// src/pages/enterprise/SettlementDetailPage.jsx
// ENT — corporate settlement detail: per-trip cost breakdown + confirm/dispute.
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, AlertTriangle, CheckCircle2, QrCode, Copy, X, Upload, ImageIcon } from 'lucide-react';
import {
  enterpriseService,
  SETTLEMENT_STATUS_LABEL,
  SETTLEMENT_STATUS_BADGE,
} from '../../services/enterpriseService.js';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format.js';
import Loading from '../../components/common/Loading.jsx';

const unwrap = (res) => res?.data ?? res ?? {};

export default function EnterpriseSettlementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useOutletContext() || {};
  const [disputeNote, setDisputeNote] = useState('');
  const [showDispute, setShowDispute] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showProofUpload, setShowProofUpload] = useState(false);
  const fileInputRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['enterprise', 'settlement', id],
    queryFn: () => enterpriseService.getSettlement(id),
    enabled: Boolean(isAdmin) && !!id,
    // Manual flow: after the company bấm "đã thanh toán" (PAYMENT_DECLARED), OtoRent
    // staff verify the transfer and flip it to PAID. Poll while awaiting that manual
    // confirmation so the flip surfaces here without a refresh. Stop once PAID/DRAFT.
    refetchInterval: (query) => {
      const s = query.state.data?.data?.settlement || query.state.data?.settlement || query.state.data;
      return s && ['SENT', 'CONFIRMED', 'DISPUTED', 'PAYMENT_DECLARED'].includes(s.status)
        ? 8000
        : false;
    },
  });

  const confirmMut = useMutation({
    mutationFn: () => enterpriseService.confirmSettlement(id),
    onSuccess: () => {
      toast.success('Đã xác nhận bảng kê');
      queryClient.invalidateQueries({ queryKey: ['enterprise', 'settlement', id] });
      queryClient.invalidateQueries({ queryKey: ['enterprise', 'settlements'] });
    },
    onError: (err) => toast.error(err?.message || 'Xác nhận thất bại'),
  });

  const disputeMut = useMutation({
    mutationFn: () => enterpriseService.disputeSettlement(id, { note: disputeNote.trim() }),
    onSuccess: () => {
      toast.success('Đã gửi phản hồi');
      setShowDispute(false);
      setDisputeNote('');
      queryClient.invalidateQueries({ queryKey: ['enterprise', 'settlement', id] });
      queryClient.invalidateQueries({ queryKey: ['enterprise', 'settlements'] });
    },
    onError: (err) => toast.error(err?.message || 'Gửi phản hồi thất bại'),
  });

  // Manual bank-transfer: bấm "Tôi đã thanh toán" → BE luôn báo admin OtoRent
  // (kể cả khi chưa kịp gửi ảnh), rồi chuyển bảng kê sang PAYMENT_DECLARED.
  const declareMut = useMutation({
    mutationFn: () => enterpriseService.declareSettlementPaid(id),
    onSuccess: () => {
      toast.success('Đã báo thanh toán — OtoRent sẽ kiểm tra và xác nhận');
      setShowProofUpload(true);
      queryClient.invalidateQueries({ queryKey: ['enterprise', 'settlement', id] });
      queryClient.invalidateQueries({ queryKey: ['enterprise', 'settlements'] });
    },
    onError: (err) => toast.error(err?.message || 'Báo thanh toán thất bại'),
  });

  // Follow-up: gửi ảnh chuyển khoản (không bắt buộc — admin đã được báo ở bước trên).
  const uploadProofMut = useMutation({
    mutationFn: (file) => enterpriseService.uploadSettlementProof(id, file),
    onSuccess: () => {
      toast.success('Đã gửi ảnh chuyển khoản cho OtoRent');
      if (fileInputRef.current) fileInputRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: ['enterprise', 'settlement', id] });
    },
    onError: (err) => {
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.error(err?.message || 'Gửi ảnh thất bại');
    },
  });

  const onPickProof = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadProofMut.mutate(file);
  };

  // VietQR — fetched only when the payment modal is open. Settlement must be in a
  // payable status (SENT/CONFIRMED/DISPUTED); the BE guards this too.
  const { data: qrData, isLoading: qrLoading } = useQuery({
    queryKey: ['enterprise', 'settlement', id, 'qr'],
    queryFn: () => enterpriseService.getSettlementQr(id),
    enabled: Boolean(isAdmin) && !!id && showQr,
  });
  const qr = unwrap(qrData)?.qr || unwrap(qrData);

  // When polling picks up OtoRent's manual PAID flip, toast once and close the modal.
  const paidStatus = (unwrap(data)?.settlement || unwrap(data))?.status;
  const prevPaidStatusRef = useRef(paidStatus);
  
  useEffect(() => {
    if (paidStatus === 'PAID' && prevPaidStatusRef.current !== 'PAID') {
      setShowQr(false);
      toast.success('Đã nhận được thanh toán — bảng kê chuyển sang Đã thanh toán');
    }
    prevPaidStatusRef.current = paidStatus;
  }, [paidStatus]);

  const copy = (text) => {
    navigator.clipboard?.writeText(String(text)).then(
      () => toast.success('Đã copy'),
      () => toast.error('Không copy được')
    );
  };

  if (!isAdmin) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-ink-500 shadow-sm ring-1 ring-ink-100">
        Chỉ Corporate Admin xem quyết toán.
      </div>
    );
  }
  if (isLoading) return <Loading />;

  const settlement = unwrap(data)?.settlement || unwrap(data);
  if (!settlement?.id) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-ink-500 shadow-sm ring-1 ring-ink-100">
        Không tìm thấy kỳ quyết toán.
      </div>
    );
  }

  const bookings = settlement.bookings || [];
  const canAct = settlement.status === 'SENT';
  const canDispute = settlement.status === 'SENT';
  // Có thể bấm "Tôi đã thanh toán" khi bảng kê đã gửi và chưa thanh toán (BE cũng chặn).
  const canDeclare = ['SENT', 'CONFIRMED', 'DISPUTED'].includes(settlement.status);
  const declared = settlement.status === 'PAYMENT_DECLARED';
  // Ảnh chuyển khoản gửi được ở các trạng thái BE cho phép (assertCanAttachProof).
  const canUploadProof = ['SENT', 'CONFIRMED', 'DISPUTED', 'PAYMENT_DECLARED'].includes(
    settlement.status
  );
  const termDays = settlement.corporate?.paymentTermDays;
  const isCredit = termDays > 0;
  const termText = isCredit
    ? `kỳ hạn theo hợp đồng ${termDays} ngày`
    : 'thanh toán sau mỗi lần đặt xe';

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/enterprise/settlements')}
        className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" /> Danh sách quyết toán
      </button>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-ink-700">Bảng kê #{settlement.id}</h1>
            <p className="text-sm text-ink-400">
              Kỳ {formatDate(settlement.periodStart)} → {formatDate(settlement.periodEnd)}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              SETTLEMENT_STATUS_BADGE[settlement.status] || 'bg-ink-100 text-ink-500'
            }`}
          >
            {SETTLEMENT_STATUS_LABEL[settlement.status] || settlement.status}
          </span>
        </div>

        {/* Totals */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TotalCard label="Giá cơ bản" value={settlement.totalBaseAmount} />
          <TotalCard label="Phụ phí (đã duyệt)" value={settlement.totalExpenses} />
          <TotalCard label="VAT (10%)" value={settlement.totalVat} />
          <TotalCard label="Tổng phải trả" value={settlement.totalAmount} highlight />
        </div>

        {settlement.status === 'PAID' && settlement.invoiceRef && (
          <p className="mt-3 inline-flex items-center gap-1 text-sm text-sky-700">
            <CheckCircle2 className="h-4 w-4" /> Đã thanh toán · Mã hoá đơn:{' '}
            <span className="font-mono">{settlement.invoiceRef}</span>
          </p>
        )}
        {settlement.confirmedAt && (
          <p className="mt-1 text-sm text-emerald-700">
            Đã xác nhận lúc {formatDateTime(settlement.confirmedAt)}
          </p>
        )}
        {settlement.status === 'DISPUTED' && settlement.note && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-semibold">Phản hồi của bạn</div>
              <div>{settlement.note}</div>
            </div>
          </div>
        )}
      </div>

      {/*
        [DISABLED — SePay auto-reconcile] Không xóa, chỉ comment lại. Trước đây quét
        VietQR rồi hệ thống tự đối soát khi tiền về (SePay). Nay chuyển sang chuyển
        khoản thủ công + bấm "Tôi đã thanh toán" + gửi ảnh cho admin OtoRent.

        Payment — VietQR bank transfer, tu dong doi soat khi tien ve (SePay).
        <div className="space-y-3 rounded-2xl bg-ink-50 p-4 text-sm text-ink-500 ring-1 ring-ink-100">
          <p>
            {isCredit
              ? `Thanh toán công nợ (${termText}) — chuyển khoản sau khi nhận đủ bảng kê + lệnh điều xe + hoá đơn GTGT.`
              : `${termText} — chuyển khoản ngay sau khi chốt bảng kê + hoá đơn GTGT của kỳ.`}{' '}
            Quét VietQR để chuyển khoản; hệ thống tự động ghi nhận khi tiền về (không cần thao tác thủ công).
          </p>
          {canPay && (
            <button
              type="button"
              onClick={() => setShowQr(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
            >
              <QrCode className="h-4 w-4" /> Thanh toán VietQR
            </button>
          )}
        </div>
      */}

      {/* Payment — chuyển khoản thủ công: xem QR + STK để chuyển, rồi bấm "Tôi đã
          thanh toán" (báo admin OtoRent ngay), sau đó gửi ảnh chuyển khoản (không bắt buộc). */}
      {settlement.status !== 'PAID' && (
        <div className="space-y-3 rounded-2xl bg-ink-50 p-4 text-sm text-ink-500 ring-1 ring-ink-100">
          <p>
            {isCredit
              ? `Thanh toán công nợ (${termText}) — chuyển khoản sau khi nhận đủ bảng kê + lệnh điều xe + hoá đơn GTGT.`
              : `${termText} — chuyển khoản ngay sau khi chốt bảng kê + hoá đơn GTGT của kỳ.`}{' '}
            Quét mã QR hoặc chuyển khoản theo thông tin tài khoản bên dưới, sau đó bấm
            &quot;Tôi đã thanh toán&quot; và gửi ảnh chuyển khoản để OtoRent kiểm tra.
          </p>

          {declared && (
            <div className="flex items-start gap-2 rounded-xl bg-indigo-50 p-3 text-indigo-700 ring-1 ring-indigo-100">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div className="font-semibold">Đã báo thanh toán</div>
                <div className="text-xs">
                  OtoRent đã nhận thông báo và đang kiểm tra chuyển khoản
                  {settlement.paymentDeclaredAt
                    ? ` (lúc ${formatDateTime(settlement.paymentDeclaredAt)})`
                    : ''}
                  . Bạn có thể gửi kèm ảnh chuyển khoản bên dưới.
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setShowProofUpload(false);
                setShowQr(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50"
            >
              <QrCode className="h-4 w-4" /> Xem QR &amp; số tài khoản
            </button>
            {canDeclare && (
              <button
                type="button"
                disabled={declareMut.isPending}
                onClick={() => declareMut.mutate()}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                {declareMut.isPending ? 'Đang gửi...' : 'Tôi đã thanh toán'}
              </button>
            )}
          </div>

          {/* Ảnh chuyển khoản — không bắt buộc; admin đã được báo ở bước "Tôi đã thanh toán". */}
          {canUploadProof && (
            <div className="space-y-2 rounded-xl bg-white p-3 ring-1 ring-ink-100">
              <div className="flex items-center gap-2 font-medium text-ink-700">
                <ImageIcon className="h-4 w-4" /> Ảnh chuyển khoản (không bắt buộc)
              </div>
              {settlement.paymentProofUrl ? (
                <div className="space-y-2">
                  <a
                    href={settlement.paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <img
                      src={settlement.paymentProofUrl}
                      alt="Ảnh chuyển khoản đã gửi"
                      className="max-h-48 rounded-lg ring-1 ring-ink-100"
                    />
                  </a>
                  <p className="text-xs text-emerald-700">Đã gửi ảnh cho OtoRent.</p>
                </div>
              ) : (
                <p className="text-xs text-ink-400">
                  Gửi ảnh biên lai/màn hình chuyển khoản để OtoRent đối chiếu nhanh hơn.
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickProof}
              />
              <button
                type="button"
                disabled={uploadProofMut.isPending}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-ink-100 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-200 disabled:opacity-60"
              >
                <Upload className="h-4 w-4" />
                {uploadProofMut.isPending
                  ? 'Đang gửi ảnh...'
                  : settlement.paymentProofUrl
                    ? 'Gửi lại ảnh khác'
                    : 'Chọn ảnh chuyển khoản'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {canAct && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={confirmMut.isPending}
            onClick={() => confirmMut.mutate()}
            className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {confirmMut.isPending ? 'Đang xác nhận...' : 'Xác nhận bảng kê'}
          </button>
          {canDispute && (
            <button
              type="button"
              onClick={() => setShowDispute((v) => !v)}
              className="rounded-xl bg-ink-100 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-200"
            >
              Phản hồi (dispute)
            </button>
          )}
        </div>
      )}

      {showDispute && canDispute && (
        <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
          <h2 className="font-semibold text-ink-700">Lý do phản hồi</h2>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
            placeholder="Nêu rõ sai sót cần CarGoGo điều chỉnh..."
            value={disputeNote}
            onChange={(e) => setDisputeNote(e.target.value)}
          />
          <button
            type="button"
            disabled={disputeMut.isPending || !disputeNote.trim()}
            onClick={() => disputeMut.mutate()}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {disputeMut.isPending ? 'Đang gửi...' : 'Gửi phản hồi'}
          </button>
        </div>
      )}

      {/* Per-trip breakdown */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
        <h2 className="border-b border-ink-50 px-5 py-3 font-semibold text-ink-700">
          Chi tiết chuyến ({bookings.length})
        </h2>
        {bookings.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-400">Không có chuyến trong kỳ</p>
        ) : (
          <div className="divide-y divide-ink-50">
            {bookings.map((b) => {
              const line = b._line || {};
              return (
                <div key={b.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium text-ink-700">
                      #{b.id} · {b.pickupAddress} → {b.dropoffAddress}
                    </div>
                    <div className="text-xs text-ink-400">
                      {formatDate(b.completedAt || b.pickupAt)}
                      {b.employee?.user?.fullName ? ` · ${b.employee.user.fullName}` : ''}
                    </div>
                  </div>
                  <div className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <Row label="Giá cơ bản" value={line.basePrice} />
                    <Row label="Phụ phí" value={line.expenseTotal} />
                    <Row label="VAS" value={line.vasTotal} />
                    <Row label="VAT 10%" value={line.vat10} />
                  </div>
                  <div className="mt-1 text-right text-sm font-semibold text-ink-800">
                    Cộng: {formatCurrency(line.total || 0)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* VietQR modal */}
      {showQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowQr(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-ink-700">Chuyển khoản VietQR</h2>
              <button
                type="button"
                onClick={() => setShowQr(false)}
                className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {qrLoading || !qr ? (
              <div className="py-10 text-center text-sm text-ink-400">Đang tạo mã QR...</div>
            ) : (
              <div className="space-y-3">
                <img
                  src={qr.qrImageUrl}
                  alt={`VietQR bảng kê #${settlement.id}`}
                  className="mx-auto w-56 rounded-xl ring-1 ring-ink-100"
                />
                <dl className="space-y-1.5 text-sm">
                  <QrRow label="Ngân hàng" value={qr.bank} />
                  <QrRow label="Chủ TK" value={qr.accountName} />
                  <QrRow label="Số TK" value={qr.accountNumber} onCopy={() => copy(qr.accountNumber)} />
                  <QrRow
                    label="Số tiền"
                    value={formatCurrency(qr.amount)}
                    onCopy={() => copy(qr.amount)}
                  />
                  <QrRow label="Nội dung" value={qr.memo} onCopy={() => copy(qr.memo)} />
                </dl>
                <p className="rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700">
                  Giữ nguyên nội dung chuyển khoản để OtoRent đối chiếu nhanh. Chuyển khoản xong,
                  bấm &quot;Tôi đã thanh toán&quot; để báo OtoRent kiểm tra và xác nhận.
                </p>
                {canDeclare && !showProofUpload && (
                  <button
                    type="button"
                    disabled={declareMut.isPending}
                    onClick={() => declareMut.mutate()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {declareMut.isPending ? 'Đang gửi...' : 'Tôi đã thanh toán'}
                  </button>
                )}

                {(showProofUpload || declared) && canUploadProof && (
                  <div className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                    <div className="flex items-center gap-2 font-semibold text-indigo-800">
                      <ImageIcon className="h-4 w-4" />
                      Bước 2: Gửi ảnh xác nhận chuyển khoản
                    </div>
                    <p className="text-xs text-indigo-700">
                      Ảnh chụp màn hình giao dịch giúp OtoRent đối chiếu nhanh hơn. Bạn có thể bỏ qua bước này;
                      thông báo đã thanh toán đã được gửi.
                    </p>
                    {settlement.paymentProofUrl && (
                      <a
                        href={settlement.paymentProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                      >
                        <img
                          src={settlement.paymentProofUrl}
                          alt="Ảnh chuyển khoản đã gửi"
                          className="max-h-40 rounded-lg bg-white ring-1 ring-indigo-200"
                        />
                      </a>
                    )}
                    <button
                      type="button"
                      disabled={uploadProofMut.isPending}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-800 ring-1 ring-indigo-200 hover:bg-indigo-100 disabled:opacity-60"
                    >
                      <Upload className="h-4 w-4" />
                      {uploadProofMut.isPending
                        ? 'Đang gửi ảnh...'
                        : settlement.paymentProofUrl
                          ? 'Gửi lại ảnh khác'
                          : 'Chọn ảnh chuyển khoản'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function QrRow({ label, value, onCopy }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-ink-400">{label}</span>
      <span className="flex items-center gap-1.5 text-right font-medium text-ink-700">
        {value}
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="rounded p-0.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </span>
    </div>
  );
}

function TotalCard({ label, value, highlight }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-brand-primary/10' : 'bg-ink-50'}`}>
      <div className="text-xs text-ink-400">{label}</div>
      <div className={`text-lg font-bold ${highlight ? 'text-brand-primary' : 'text-ink-800'}`}>
        {formatCurrency(value || 0)}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-ink-400">{label}</span>
      <span className="text-ink-700">{formatCurrency(value || 0)}</span>
    </div>
  );
}
