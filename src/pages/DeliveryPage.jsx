// src/pages/DeliveryPage.jsx — Day 36. Figma: Delivery.png (policy content)
// Static "Chính sách giao xe" prose page.
import { Link } from 'react-router-dom';
import { ChevronRight, Truck, MapPin, Clock, ShieldCheck } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: MapPin,
    title: 'Giao xe tận nơi',
    desc: 'Hỗ trợ giao xe tại nhà, sân bay, khách sạn trong nội thành TP.HCM, Hà Nội và Đà Nẵng.',
  },
  {
    icon: Clock,
    title: 'Đúng giờ hẹn',
    desc: 'Xe được bàn giao đúng khung giờ bạn chọn, có xác nhận trước 2 giờ qua điện thoại.',
  },
  {
    icon: ShieldCheck,
    title: 'Kiểm tra minh bạch',
    desc: 'Biên bản bàn giao ghi rõ tình trạng xe, mức nhiên liệu và số km trước khi nhận.',
  },
];

const STEPS = [
  {
    title: '1. Xác nhận đơn thuê',
    body: 'Sau khi thanh toán thành công, nhân viên OtoRent sẽ liên hệ trong vòng 30 phút để xác nhận thời gian và địa điểm nhận xe.',
  },
  {
    title: '2. Chuẩn bị giấy tờ',
    body: 'Vui lòng chuẩn bị CCCD/CMND, giấy phép lái xe còn hiệu lực và khoản đặt cọc theo dòng xe đã chọn.',
  },
  {
    title: '3. Bàn giao & kiểm tra xe',
    body: 'Hai bên cùng kiểm tra ngoại thất, nội thất, mức nhiên liệu, số km và ký biên bản bàn giao trước khi nhận xe.',
  },
  {
    title: '4. Nhận xe & khởi hành',
    body: 'Sau khi hoàn tất thủ tục, bạn nhận chìa khóa và bắt đầu hành trình. OtoRent hỗ trợ 24/7 trong suốt thời gian thuê.',
  },
];

export default function DeliveryPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-900">
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/95 to-ink-800" />
        <div className="container-app relative z-10 py-12 md:py-16">
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-white/60">
            <Link to="/" className="transition hover:text-white">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-white">Chính sách giao xe</span>
          </nav>
          <p className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent">
            <Truck className="h-4 w-4" /> Giao nhận xe
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Chính sách giao xe</h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Quy trình giao nhận xe minh bạch, nhanh chóng và an toàn cho mọi chuyến đi của bạn.
          </p>
        </div>
      </section>

      <div className="container-app py-10 lg:py-14">
        {/* Highlights */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mb-1 text-base font-bold text-ink-900">{title}</h3>
              <p className="text-sm leading-relaxed text-ink-500">{desc}</p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-ink-900">Quy trình giao xe</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              4 bước đơn giản từ lúc xác nhận đơn đến khi bạn cầm lái. OtoRent đồng hành cùng bạn ở
              mỗi bước.
            </p>
          </div>
          <div className="space-y-4 lg:col-span-2">
            {STEPS.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100"
              >
                <h3 className="mb-1 text-base font-semibold text-brand-primary">{s.title}</h3>
                <p className="text-sm leading-relaxed text-ink-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fees note */}
        <div className="mt-12 rounded-2xl bg-brand-accent/10 p-6 ring-1 ring-brand-accent/20 md:p-8">
          <h2 className="mb-3 text-lg font-bold text-ink-900">Phí giao xe</h2>
          <ul className="space-y-2 text-sm leading-relaxed text-ink-600">
            <li>• Miễn phí giao xe trong bán kính 10km từ điểm thuê.</li>
            <li>• Từ 200.000đ tùy khoảng cách đối với khu vực nội thành mở rộng.</li>
            <li>• Giao xe tại sân bay: phụ phí theo bảng giá niêm yết tại thời điểm đặt.</li>
            <li>• Phí sẽ được hiển thị rõ ràng trong bước xác nhận trước khi thanh toán.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
