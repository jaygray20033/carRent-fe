// src/pages/PaymentMethodsPage.jsx — Phương thức thanh toán (static content).
import { Link } from 'react-router-dom';
import { ChevronRight, CreditCard, Building2, Banknote, Wallet, ShieldCheck } from 'lucide-react';

const METHODS = [
  {
    icon: CreditCard,
    title: 'Thanh toán trực tuyến qua VNPay',
    description: 'Thanh toán nhanh chóng qua thẻ ATM nội địa, tài khoản ngân hàng hoặc mã QR VNPay.',
    notes: ['Xác nhận tự động sau khi giao dịch thành công.', 'Được bảo vệ bởi hệ thống bảo mật của VNPay.'],
  },
  {
    icon: Building2,
    title: 'Chuyển khoản ngân hàng',
    description: 'Chuyển khoản theo thông tin được hiển thị tại bước thanh toán của đơn thuê xe.',
    notes: ['Ghi đúng mã đơn thuê trong nội dung chuyển khoản.', 'Đơn được xác nhận sau khi CarGoGo nhận được tiền.'],
  },
  {
    icon: Banknote,
    title: 'Thanh toán khi nhận xe',
    description: 'Thanh toán trực tiếp với nhân viên khi hoàn tất thủ tục bàn giao xe.',
    notes: ['Áp dụng với các dòng xe và khu vực được hỗ trợ.', 'Tiền đặt cọc có thể cần thanh toán trước để giữ xe.'],
  },
  {
    icon: Wallet,
    title: 'Ví CarGoGo',
    description: 'Sử dụng số dư hoàn tiền hoặc số dư đã nạp trong ví để thanh toán đơn thuê.',
    notes: ['Khấu trừ tức thời khi xác nhận thanh toán.', 'Có thể kết hợp với phương thức khác nếu số dư không đủ.'],
  },
];

export default function PaymentMethodsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-900">
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/95 to-ink-800" />
        <div className="container-app relative z-10 py-12 md:py-16">
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-white/90">
            <Link to="/" className="transition hover:text-brand-accent">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-brand-accent">Phương thức thanh toán</span>
          </nav>
          <p className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent">
            <ShieldCheck className="h-4 w-4" /> Thanh toán an toàn
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Phương thức thanh toán</h1>
          <p className="mt-2 max-w-xl text-sm text-white/85">
            Lựa chọn hình thức thanh toán thuận tiện và phù hợp với chuyến đi của bạn.
          </p>
        </div>
      </section>

      <div className="container-app py-10 lg:py-14">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {METHODS.map(({ icon: Icon, title, description, notes }) => (
            <section key={title} className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="text-lg font-bold text-ink-900">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>
              <ul className="mt-4 space-y-2">
                {notes.map((note) => (
                  <li key={note} className="flex gap-2 text-sm leading-relaxed text-ink-600">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-primary" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-2xl bg-brand-accent/10 p-6 ring-1 ring-brand-accent/20 md:p-8">
          <h2 className="mb-3 text-lg font-bold text-ink-900">Hoàn tiền và tiền đặt cọc</h2>
          <ul className="space-y-2 text-sm leading-relaxed text-ink-600">
            <li>• Tiền đặt cọc được hoàn sau khi xe được kiểm tra và hoàn tất bàn giao.</li>
            <li>• Thời gian tiền về tài khoản phụ thuộc vào ngân hàng hoặc cổng thanh toán.</li>
            <li>• Các khoản phí phát sinh được đối soát minh bạch trước khi hoàn cọc.</li>
          </ul>
          <p className="mt-4 text-sm text-ink-600">
            Cần hỗ trợ về giao dịch?{' '}
            <Link to="/contact" className="font-semibold text-brand-primary hover:underline">
              Liên hệ CarGoGo
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
