import { Shield, Clock, DollarSign, Headphones } from 'lucide-react';

/**
 * Section 4 — "Tại sao chọn OtoRent"
 * 4 cột icon + title + desc, nền đen tương phản
 */
const REASONS = [
  {
    icon: Shield,
    title: 'An toàn & Tin cậy',
    desc: 'Tất cả các xe đều được bảo hiểm toàn diện, kiểm tra kỹ lưỡng trước mỗi chuyến đi.',
  },
  {
    icon: Clock,
    title: 'Nhanh chóng & Tiện lợi',
    desc: 'Đặt xe online chỉ trong 2 phút. Giao nhận xe tận nơi, tiết kiệm thời gian.',
  },
  {
    icon: DollarSign,
    title: 'Giá cả minh bạch',
    desc: 'Không phí ẩn, cam kết giá tốt nhất thị trường. Đa dạng phương thức thanh toán.',
  },
  {
    icon: Headphones,
    title: 'Hỗ trợ 24/7',
    desc: 'Đội ngũ CSKH luôn sẵn sàng hỗ trợ mọi lúc, mọi nơi. Cứu hộ khẩn cấp 24/7.',
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why-choose" className="bg-ink-900 py-16 md:py-20">
      <div className="container-app">
        <div className="text-center mb-10">
          <p className="text-brand-accent font-semibold text-sm mb-2">Tại sao chọn OtoRent?</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Trải nghiệm dịch vụ thuê xe <span className="text-brand-accent">đẳng cấp</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REASONS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-4 group-hover:bg-brand-accent/20 transition">
                <Icon className="w-6 h-6 text-brand-accent" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
