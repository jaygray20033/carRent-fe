// src/pages/booking/PaymentResultPage.jsx
// Landing page after the VNPay redirect (route: /payment/result).
// Reads status + txnRef + bookingId from the query string and shows a
// full-screen success / failure card with deep links back into the app.
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, RotateCcw, FileText } from 'lucide-react';

export default function PaymentResultPage() {
  const [params] = useSearchParams();
  const status = params.get('status'); // 'success' | 'failed' | 'invalid'
  const txnRef = params.get('txnRef');
  const bookingId = params.get('bookingId');
  const ok = status === 'success';

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="card p-8 text-center">
        <div
          className={`mx-auto mb-3 inline-flex rounded-full p-3 ${
            ok ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}
        >
          {ok ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          {ok ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {ok
            ? 'Đơn đặt xe của bạn đã được xác nhận.'
            : status === 'invalid'
              ? 'Không xác thực được kết quả thanh toán. Vui lòng thử lại.'
              : 'Giao dịch chưa hoàn tất hoặc đã bị hủy.'}
        </p>

        {txnRef && (
          <p className="mt-3 text-xs text-gray-400">
            Mã giao dịch: <span className="font-mono">{txnRef}</span>
          </p>
        )}

        <div className="mt-6 flex justify-center gap-2">
          {bookingId ? (
            <Link to={`/me/bookings/${bookingId}`} className="btn-primary">
              <FileText className="mr-1.5 h-4 w-4" />
              Xem đơn
            </Link>
          ) : (
            <Link to="/me/bookings" className="btn-primary">
              <FileText className="mr-1.5 h-4 w-4" />
              Đơn của tôi
            </Link>
          )}

          {!ok &&
            (bookingId ? (
              <Link to={`/payment/${bookingId}`} className="btn-outline">
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Thử lại
              </Link>
            ) : (
              <Link to="/cars" className="btn-outline">
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Thử lại
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
