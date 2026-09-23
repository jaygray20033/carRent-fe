// src/pages/admin/corporate/ClientDetailPage.jsx
// B2B Day 7 — contract + price config + settlements lifecycle for one client.
// Settlement lifecycle (CarGoGo side): DRAFT → SENT → (corp CONFIRMED) → PAID.
// Payment is offline reconciliation (bank transfer within paymentTermDays),
// NOT an online gateway — admin marks PAID with the VAT invoice ref once the
// company's transfer lands.
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Building2, Send, Download, QrCode, Copy, X } from 'lucide-react';
import { adminCorporateService } from '../../../services/adminService.js';
import {
  SETTLEMENT_STATUS_LABEL,
  SETTLEMENT_STATUS_BADGE,
} from '../../../services/enterpriseService.js';
import { formatCurrency, formatDate } from '../../../utils/format.js';
import Loading from '../../../components/common/Loading.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import PriceTable from '../../../components/corporate/PriceTable.jsx';

const unwrap = (res) => res?.data ?? res ?? {};
const todayInput = () => new Date().toISOString().slice(0, 10);

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [period, setPeriod] = useState({ periodStart: todayInput(), periodEnd: todayInput() });
  const [qrFor, setQrFor] = useState(null); // settlement id whose VietQR is shown

  const { data: clientRes, isLoading } = useQuery({
    queryKey: ['adminCorporateClient', id],
    queryFn: () => adminCorporateService.getClient(id),
    enabled: !!id,
  });
  const { data: priceRes } = useQuery({
    queryKey: ['adminCorporatePrice', id],
    queryFn: () => adminCorporateService.getPriceConfig(id),
    enabled: !!id,
  });
  const { data: settlementsRes } = useQuery({
    queryKey: ['adminCorporateSettlements', id],
    queryFn: () => adminCorporateService.listSettlements(id, { size: 20 }),
    enabled: !!id,
  });
  const { data: bookingsRes } = useQuery({
    queryKey: ['adminCorporateBookingsClient', id],
    queryFn: () => adminCorporateService.listBookings({ corporateId: id, size: 20 }),
    enabled: !!id,
  });

  const invalidateSettlements = () =>
    queryClient.invalidateQueries({ queryKey: ['adminCorporateSettlements', id] });

  const createMut = useMutation({
    mutationFn: () => adminCorporateService.createSettlement(id, period),
    onSuccess: () => {
      toast.success('Đã tạo kỳ quyết toán (DRAFT)');
      invalidateSettlements();
    },
    onError: (err) => toast.error(err?.message || 'Tạo kỳ thất bại'),
  });

  const sendMut = useMutation({
    mutationFn: (sid) => adminCorporateService.sendSettlement(sid),
    onSuccess: () => {
      toast.success('Đã gửi bảng kê cho doanh nghiệp');
      invalidateSettlements();
    },
    onError: (err) => toast.error(err?.message || 'Gửi bảng kê thất bại'),
  });



  const downloadPdf = async (sid) => {
    try {
      const blob = await adminCorporateService.exportSettlementPdf(sid);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `settlement-${sid}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err?.message || 'Không tải được PDF');
    }
  };

  // VietQR for the open settlement (admin can show a company the transfer QR).
  const { data: qrRes, isLoading: qrLoading } = useQuery({
    queryKey: ['adminCorporateSettlementQr', qrFor],
    queryFn: () => adminCorporateService.getSettlementQr(qrFor),
    enabled: !!qrFor,
  });
  const qr = (() => {
    const p = unwrap(qrRes);
    return p?.qr || p;
  })();

  const copy = (text) => {
    navigator.clipboard?.writeText(String(text)).then(
      () => toast.success('Đã copy'),
      () => toast.error('Không copy được')
    );
  };

  const client = unwrap(clientRes)?.client || unwrap(clientRes);
  const priceConfig = unwrap(priceRes)?.priceConfig || unwrap(priceRes) || client?.priceConfig;
  const settlements = (() => {
    const p = unwrap(settlementsRes);
    return Array.isArray(p) ? p : p.items || [];
  })();
  const bookings = (() => {
    const p = unwrap(bookingsRes);
    return Array.isArray(p) ? p : p.items || [];
  })();

  if (isLoading) return <Loading />;
  if (!client?.id) {
    return <EmptyState title="Không tìm thấy công ty" icon={Building2} />;
  }

  const isCredit = client.paymentTermDays > 0;
  const termText = isCredit
    ? `kỳ hạn theo hợp đồng ${client.paymentTermDays} ngày`
    : 'thanh toán sau mỗi lần đặt xe';

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/admin/corporate/clients')}
        className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" /> Danh sách công ty
      </button>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <h1 className="text-xl font-bold text-ink-700">{client.name}</h1>
        <div className="mt-2 grid gap-2 text-sm text-ink-500 sm:grid-cols-2">
          <div>MST: <span className="font-mono text-ink-700">{client.taxCode}</span></div>
          <div>HĐ: {client.contractRef || '—'}</div>
          <div>Liên hệ: {client.contactName || '—'} · {client.contactPhone || ''}</div>
          <div>Email: {client.contactEmail || '—'}</div>
          <div>Credit: {formatCurrency(client.creditLimit || 0)}</div>
          <div>Payment term: {client.paymentTermDays ?? 0} ngày</div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <h2 className="mb-3 font-semibold text-ink-700">Bảng giá</h2>
        <PriceTable priceConfig={priceConfig} />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <h2 className="mb-3 font-semibold text-ink-700">Chuyến gần đây</h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-ink-300">Chưa có chuyến</p>
        ) : (
          <ul className="divide-y divide-ink-50 text-sm">
            {bookings.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  #{b.id} · {b.vehicleType} · {b.rentalType}
                </span>
                <span className="text-ink-400">{b.status}</span>
                <span className="font-medium">{formatCurrency(b.finalAmount ?? b.basePrice)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Settlements lifecycle ─────────────────────────────────── */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <h2 className="mb-1 font-semibold text-ink-700">Quyết toán & Thanh toán</h2>
        <p className="mb-4 text-xs text-ink-400">
          {isCredit
            ? `Thanh toán công nợ (${termText}) — doanh nghiệp chuyển khoản sau khi nhận đủ bảng kê + lệnh điều xe + hoá đơn GTGT.`
            : `${termText} — doanh nghiệp chuyển khoản ngay sau khi chốt bảng kê + hoá đơn GTGT của kỳ.`}{' '}
          Đánh dấu &quot;Đã thanh toán&quot; khi tiền về (không thanh toán trực tuyến).
        </p>

        {/* Create new period */}
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl bg-ink-50 p-3">
          <label className="text-xs text-ink-500">
            Từ ngày
            <input
              type="date"
              className="mt-1 block rounded-lg border border-ink-200 px-2 py-1.5 text-sm"
              value={period.periodStart}
              onChange={(e) => setPeriod((p) => ({ ...p, periodStart: e.target.value }))}
            />
          </label>
          <label className="text-xs text-ink-500">
            Đến ngày
            <input
              type="date"
              className="mt-1 block rounded-lg border border-ink-200 px-2 py-1.5 text-sm"
              value={period.periodEnd}
              onChange={(e) => setPeriod((p) => ({ ...p, periodEnd: e.target.value }))}
            />
          </label>
          <button
            type="button"
            disabled={createMut.isPending}
            onClick={() => createMut.mutate()}
            className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {createMut.isPending ? 'Đang tạo...' : 'Tạo kỳ quyết toán'}
          </button>
        </div>

        {settlements.length === 0 ? (
          <p className="text-sm text-ink-300">Chưa có kỳ quyết toán</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-ink-400">
                <tr>
                  <th className="py-2 pr-4">Kỳ</th>
                  <th className="py-2 pr-4">Tổng</th>
                  <th className="py-2 pr-4">Trạng thái</th>
                  <th className="py-2 pr-4">Hoá đơn</th>
                  <th className="py-2">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => (
                  <tr key={s.id} className="border-t border-ink-50 align-top">
                    <td className="py-3 pr-4">
                      #{s.id} · {formatDate(s.periodStart)} → {formatDate(s.periodEnd)}
                    </td>
                    <td className="py-3 pr-4 font-medium">{formatCurrency(s.totalAmount)}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          SETTLEMENT_STATUS_BADGE[s.status] || 'bg-ink-100 text-ink-500'
                        }`}
                      >
                        {SETTLEMENT_STATUS_LABEL[s.status] || s.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-ink-500">
                      {s.invoiceRef || '—'}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {s.status === 'DRAFT' && (
                          <button
                            type="button"
                            disabled={sendMut.isPending}
                            onClick={() => sendMut.mutate(s.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-200 disabled:opacity-60"
                          >
                            <Send className="h-3.5 w-3.5" /> Gửi bảng kê
                          </button>
                        )}
                        {/*
                          [DI DỜI — không xóa, chỉ comment] Việc "Đánh dấu đã thanh toán"
                          nay nằm ở tab riêng "Xác nhận thanh toán" (/admin/corporate/payments),
                          nơi liệt kê các bảng kê doanh nghiệp đã báo chuyển khoản
                          (PAYMENT_DECLARED) + ảnh chứng minh. Tab Doanh nghiệp chỉ để xem.
                        {s.status === 'CONFIRMED' && payFor !== s.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setPayFor(s.id);
                              setInvoiceRef(s.invoiceRef || '');
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Đánh dấu đã thanh toán
                          </button>
                        )}
                        {s.status === 'CONFIRMED' && payFor === s.id && (
                          <span className="inline-flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Số hoá đơn GTGT"
                              className="w-40 rounded-lg border border-ink-200 px-2 py-1 text-xs"
                              value={invoiceRef}
                              onChange={(e) => setInvoiceRef(e.target.value)}
                            />
                            <button
                              type="button"
                              disabled={paidMut.isPending}
                              onClick={() => paidMut.mutate(s.id)}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                            >
                              {paidMut.isPending ? 'Đang lưu...' : 'Xác nhận'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPayFor(null);
                                setInvoiceRef('');
                              }}
                              className="rounded-lg bg-ink-100 px-2.5 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-200"
                            >
                              Huỷ
                            </button>
                          </span>
                        )}
                        */}
                        {['SENT', 'CONFIRMED', 'DISPUTED'].includes(s.status) && (
                          <button
                            type="button"
                            onClick={() => setQrFor(s.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-ink-100 px-2.5 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-200"
                          >
                            <QrCode className="h-3.5 w-3.5" /> QR
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => downloadPdf(s.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-ink-100 px-2.5 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-200"
                        >
                          <Download className="h-3.5 w-3.5" /> PDF
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

      {/* VietQR modal — admin can show/print the transfer QR for a company. */}
      {qrFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setQrFor(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-ink-700">VietQR bảng kê #{qrFor}</h2>
              <button
                type="button"
                onClick={() => setQrFor(null)}
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
                  alt={`VietQR bảng kê #${qrFor}`}
                  className="mx-auto w-56 rounded-xl ring-1 ring-ink-100"
                />
                <dl className="space-y-1.5 text-sm">
                  <QrRow label="Ngân hàng" value={qr.bank} />
                  <QrRow label="Chủ TK" value={qr.accountName} />
                  <QrRow label="Số TK" value={qr.accountNumber} onCopy={() => copy(qr.accountNumber)} />
                  <QrRow label="Số tiền" value={formatCurrency(qr.amount)} onCopy={() => copy(qr.amount)} />
                  <QrRow label="Nội dung" value={qr.memo} onCopy={() => copy(qr.memo)} />
                </dl>
                <p className="rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700">
                  Doanh nghiệp giữ nguyên nội dung chuyển khoản — SePay tự đối soát và chuyển bảng
                  kê sang &quot;Đã thanh toán&quot; khi tiền về.
                </p>
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
