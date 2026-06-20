import { MapPin, CalendarCheck, CreditCard, Car } from 'lucide-react';

/**
 * Section 7 — Hướng dẫn 4 bước
 * Numbered diagram vây quanh xe top-down vector
 */
const STEPS = [
  {
    num: '01',
    icon: MapPin,
    title: 'Chọn địa điểm nhận xe',
    desc: 'Tìm kiếm và chọn một trong hơn 50 điểm nhận xe trên toàn quốc.',
    color: 'bg-blue-50 text-brand-primary',
  },
  {
    num: '02',
    icon: CalendarCheck,
    title: 'Chọn thời gian thuê',
    desc: 'Chọn ngày nhận và ngày trả xe phù hợp với lịch trình của bạn.',
    color: 'bg-amber-50 text-brand-accent-dark',
  },
  {
    num: '03',
    icon: CreditCard,
    title: 'Đặt cọc & Thanh toán',
    desc: 'Thanh toán online nhanh chóng với nhiều phương thức khác nhau.',
    color: 'bg-green-50 text-success',
  },
  {
    num: '04',
    icon: Car,
    title: 'Nhận xe & Khởi hành',
    desc: 'Nhận xe tại điểm hẹn hoặc giao xe tận nơi. Bắt đầu hành trình!',
    color: 'bg-purple-50 text-purple-600',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="container-app">
        <div className="text-center mb-12">
          <p className="text-brand-primary font-semibold text-sm mb-1">Hướng dẫn đặt xe</p>
          <h2 className="text-2xl md:text-3xl font-bold text-ink-900">
            Làm thế nào để đặt xe trên <span className="text-brand-primary">OtoRent</span>
          </h2>
        </div>

        <div className="relative">
          {/* Center car image (desktop only) */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 z-0">
            <img
              src="https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=400&fit=crop"
              alt="Car top view"
              className="w-full h-full object-contain opacity-10"
            />
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {STEPS.map(({ num, icon: Icon, title, desc, color }, i) => (
              <div
                key={num}
                className="text-center p-6 rounded-2xl bg-white border border-ink-100 hover:shadow-card-hover transition-shadow duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-4xl font-bold text-ink-100 mb-2">{num}</div>
                <h3 className="text-sm font-bold text-ink-900 mb-2">{title}</h3>
                <p className="text-xs text-ink-500 leading-relaxed">{desc}</p>
                {/* Connector arrow (desktop only) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 text-ink-200 text-2xl" style={{ left: `${(i + 1) * 25 - 2}%` }}>
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
