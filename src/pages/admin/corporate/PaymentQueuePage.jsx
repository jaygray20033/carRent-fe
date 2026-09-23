// src/pages/admin/corporate/PaymentQueuePage.jsx
// Admin — hàng đợi xác nhận thanh toán B2B. Liệt kê các bảng kê mà doanh nghiệp
// đã bấm "Tôi đã thanh toán" (PAYMENT_DECLARED). Staff OtoRent kiểm tra ảnh
// chuyển khoản (nếu có) rồi xác nhận đã nhận tiền → bảng kê nhảy sang PAID và
// chi tiết doanh nghiệp cho phép xuất PDF. Đây là nơi DUY NHẤT để tick "đã
// thanh toán"; tab Doanh nghiệp chỉ để xem.
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CheckCircle2, Download, ImageIcon, Wallet, X } from 'lucide-react';
import { adminCorporateService } from '../../../services/adminService.js';
import {
  SETTLEMENT_STATUS_LABEL,
  SETTLEMENT_STATUS_BADGE,
} from '../../../services/enterpriseService.js';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/format.js';
import Loading from '../../../components/common/Loading.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';

const unwrap = (res) => res?.data ?? res ?? {};

export default function PaymentQueuePage() {
  const queryClient = useQueryClient();
  const [payFor, setPayFor] = useState(null); // settlement id awaiting invoiceRef input
  const [invoiceRef, setInvoiceRef] = useState('');
  const [proofFor, setProofFor] = useState(null); // settlement whose proof image is shown

  const { data, isLoading } = useQuery({
    queryKey: ['adminSettlementQueue'],
    queryFn: () => adminCorporateService.listPaymentQueue({ size: 50 }),
    // Poll so newly declared payments surface without a manual refresh.
    refetchInterval: 15000,
  });

  const paidMut = useMutation({
    mutationFn: (sid) =>
      adminCorporateService.markSettlementPaid(sid, { invoiceRef: invoiceRef.trim() || null }),
    onSuccess: () => {
      toast.success('Đã xác nhận thanh toán — bảng kê chuyển sang Đã thanh toán');
      setPayFor(null);
      setInvoiceRef('');
      queryClient.invalidateQueries({ queryKey: ['adminSettlementQueue'] });
      // Chi tiết doanh nghiệp cũng cần refresh để trạng thái + nút PDF cập nhật.
      queryClient.invalidateQueries({ queryKey: ['adminCorporateSettlements'] });
    },
    onError: (err) => toast.error(err?.message || 'Xác nhận thanh toán thất bại'),
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

  const items = (() => {
    const p = unwrap(data);
    return Array.isArray(p) ? p : p.items || [];
  })();

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-brand-primary" />
          <h1 className="text-xl font-bold text-ink-700">Xác nhận thanh toán</h1>
        </div>
        <p className="mt-1 text-sm text-ink-400">
          Doanh nghiệp báo đã chuyển khoản cho các bảng kê dưới đây. Kiểm tra ảnh chuyển khoản
          (nếu có) và đối chiếu sao kê ngân hàng, rồi bấm &quot;Xác nhận đã nhận tiền&quot;. Khi
          xác nhận, bảng kê tự chuyển sang &quot;Đã thanh toán&quot; và có thể xuất PDF.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Chưa có bảng kê chờ xác nhận"
          description="Khi doanh nghiệp bấm 'Tôi đã thanh toán', bảng kê sẽ xuất hiện ở đây."
          icon={Wallet}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
          <table className="min-w-full text-left text-sm">
            <thead className="text-ink-400">
              <tr className="border-b border-ink-50">
                <th className="px-5 py-3">Bảng kê</th>
                <th className="px-3 py-3">Doanh nghiệp</th>
                <th className="px-3 py-3">Tổng phải trả</th>
                <th className="px-3 py-3">Báo lúc</th>
                <th className="px-3 py-3">Ảnh CK</th>
                <th className="px-3 py-3">Trạng thái</th>
                <th className="px-5 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-ink-50 align-top">
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink-700">#{s.id}</div>
                    <div className="text-xs text-ink-400">
                      {formatDate(s.periodStart)} → {formatDate(s.periodEnd)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-ink-700">{s.corporate?.name || '—'}</div>
                    <div className="font-mono text-xs text-ink-400">{s.corporate?.taxCode || ''}</div>
                  </td>
                  <td className="px-3 py-3 font-semibold text-ink-800">
                    {formatCurrency(s.totalAmount)}
                  </td>
                  <td className="px-3 py-3 text-xs text-ink-500">
                    {s.paymentDeclaredAt ? formatDateTime(s.paymentDeclaredAt) : '—'}
                  </td>
                  <td className="px-3 py-3">
                    {s.paymentProofUrl ? (
                      <button
                        type="button"
                        onClick={() => setProofFor(s)}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-100 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-200"
                      >
                        <ImageIcon className="h-3.5 w-3.5" /> Xem ảnh
                      </button>
                    ) : (
                      <span className="text-xs text-ink-300">Chưa gửi</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        SETTLEMENT_STATUS_BADGE[s.status] || 'bg-ink-100 text-ink-500'
                      }`}
                    >
                      {SETTLEMENT_STATUS_LABEL[s.status] || s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {payFor === s.id ? (
                        <span className="inline-flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Số hoá đơn GTGT (tuỳ chọn)"
                            className="w-44 rounded-lg border border-ink-200 px-2 py-1 text-xs"
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
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setPayFor(s.id);
                            setInvoiceRef(s.invoiceRef || '');
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Xác nhận đã nhận tiền
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

      {/* Proof image modal */}
      {proofFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setProofFor(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-ink-700">
                Ảnh chuyển khoản — bảng kê #{proofFor.id}
              </h2>
              <button
                type="button"
                onClick={() => setProofFor(null)}
                className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <a href={proofFor.paymentProofUrl} target="_blank" rel="noreferrer" className="block">
              <img
                src={proofFor.paymentProofUrl}
                alt={`Ảnh chuyển khoản bảng kê #${proofFor.id}`}
                className="mx-auto max-h-[70vh] rounded-lg ring-1 ring-ink-100"
              />
            </a>
            <p className="mt-2 text-xs text-ink-400">
              Nhấp vào ảnh để mở kích thước đầy đủ trong tab mới.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
