// src/pages/AboutUsPage.jsx — Day 36. Figma: AboutUs.png
// Static marketing page: hero + mission + stats + values + team.
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Clock, HeartHandshake, MapPinned } from 'lucide-react';

const STATS = [
  { value: '10.000+', label: 'Khách hàng tin dùng' },
  { value: '500+', label: 'Xe các loại' },
  { value: '63', label: 'Tỉnh thành phủ sóng' },
  { value: '4.9/5', label: 'Đánh giá trung bình' },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'An toàn & minh bạch',
    desc: 'Mọi xe đều được kiểm định kỹ lưỡng, hợp đồng rõ ràng, không phí ẩn.',
  },
  {
    icon: Clock,
    title: 'Nhanh chóng',
    desc: 'Đặt xe trong vài phút, giao xe tận nơi, thủ tục gọn nhẹ.',
  },
  {
    icon: HeartHandshake,
    title: 'Tận tâm',
    desc: 'Đội ngũ hỗ trợ 24/7, luôn đồng hành cùng bạn trên mọi hành trình.',
  },
  {
    icon: MapPinned,
    title: 'Phủ sóng rộng',
    desc: 'Mạng lưới xe và trạm cứu hộ trên khắp cả nước.',
  },
];

const TEAM = [
  { name: 'Nguyễn Minh Quân', role: 'Nhà sáng lập & CEO' },
  { name: 'Trần Thu Hà', role: 'Giám đốc vận hành' },
  { name: 'Lê Hoàng Nam', role: 'Trưởng phòng công nghệ' },
  { name: 'Phạm Bảo Ngọc', role: 'Trưởng phòng CSKH' },
];

export default function AboutUsPage() {
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
            <span className="font-medium text-white">Về chúng tôi</span>
          </nav>
          <p className="mb-1 text-sm font-semibold text-brand-accent">Về OtoRent</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Đồng hành trên mọi hành trình
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            OtoRent là nền tảng cho thuê xe tự lái và có tài xế hàng đầu Việt Nam, mang đến trải
            nghiệm thuê xe minh bạch, an toàn và tiện lợi.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="container-app py-12 lg:py-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-brand-primary">Sứ mệnh của chúng tôi</p>
            <h2 className="mb-4 text-2xl font-bold text-ink-900 md:text-3xl">
              Đưa việc thuê xe trở nên đơn giản như một cú chạm
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-ink-500">
              Chúng tôi tin rằng ai cũng xứng đáng có được sự tự do di chuyển mà không phải lo lắng
              về thủ tục rườm rà hay chi phí ẩn. OtoRent đặt niềm tin của khách hàng lên hàng đầu,
              tự hào sở hữu đội ngũ xe lớn với đa dạng dòng xe từ xe đời mới, xe tiết kiệm đến xe
              thương mại.
            </p>
            <p className="text-sm leading-relaxed text-ink-500">
              Chúng tôi luôn sẵn sàng phục vụ và cung cấp dịch vụ trên toàn lãnh thổ Việt Nam.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl shadow-card">
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=560&fit=crop"
              alt="OtoRent"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-ink-50 py-12">
        <div className="container-app grid grid-cols-2 gap-6 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-brand-primary md:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-ink-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="container-app py-12 lg:py-16">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold text-brand-primary">Giá trị cốt lõi</p>
          <h2 className="text-2xl font-bold text-ink-900 md:text-3xl">Điều làm nên OtoRent</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 transition hover:shadow-card-hover"
            >
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mb-2 text-base font-bold text-ink-900">{title}</h3>
              <p className="text-sm leading-relaxed text-ink-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-ink-50 py-12 lg:py-16">
        <div className="container-app">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold text-brand-primary">Đội ngũ</p>
            <h2 className="text-2xl font-bold text-ink-900 md:text-3xl">Những người dẫn dắt</h2>
          </div>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {TEAM.map((m) => (
              <div key={m.name} className="text-center">
                <div className="mx-auto mb-3 h-28 w-28 overflow-hidden rounded-full bg-brand-primary/10 ring-4 ring-white">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=0D6EFD&color=fff&size=200`}
                    alt={m.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="text-sm font-bold text-ink-900">{m.name}</p>
                <p className="text-xs text-ink-400">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
