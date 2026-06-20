import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

/**
 * Section 9 — Testimonials
 * Slide review + star rating
 */
const TESTIMONIALS = [
  {
    name: 'Nguyễn Minh Tuấn',
    role: 'Doanh nhân',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Dịch vụ tuyệt vời! Xe mới, sạch sẽ và được bảo dưỡng rất tốt. Tôi sẽ quay lại OtoRent cho những chuyến công tác tiếp theo.',
  },
  {
    name: 'Trần Thị Mai',
    role: 'Nhân viên văn phòng',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Lần đầu thuê xe tự lái mà mọi thứ rất dễ dàng. Nhân viên hỗ trợ nhiệt tình, giá cả hợp lý. Highly recommended!',
  },
  {
    name: 'Phạm Đức Long',
    role: 'Travel Blogger',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    rating: 4,
    text: 'Tôi đã thuê BMW X5 cho chuyến đi Đà Lạt. Xe đẹp, lái êm, giao xe đúng giờ. Chỉ trừ điểm vì app chưa hỗ trợ thanh toán Apple Pay.',
  },
  {
    name: 'Lê Thúy Hằng',
    role: 'Giám đốc Marketing',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'OtoRent là lựa chọn số 1 của công ty tôi cho xe công vụ. Đội ngũ chuyên nghiệp, xe luôn sẵn sàng.',
  },
];

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0);
  const total = TESTIMONIALS.length;

  const prev = () => setCurrent((current - 1 + total) % total);
  const next = () => setCurrent((current + 1) % total);

  const t = TESTIMONIALS[current];

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="container-app">
        <div className="text-center mb-10">
          <p className="text-brand-primary font-semibold text-sm mb-1">
            Khách hàng nói gì về chúng tôi
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-ink-900">
            Ý kiến <span className="text-brand-primary">khách hàng</span>
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Card */}
          <div className="relative bg-ink-50 rounded-2xl p-8 md:p-10">
            <Quote className="w-10 h-10 text-brand-primary/10 absolute top-6 left-6" />
            <div className="relative z-10">
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4 justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < t.rating ? 'fill-brand-accent text-brand-accent' : 'text-ink-200'
                    }`}
                  />
                ))}
              </div>
              {/* Text */}
              <p className="text-center text-ink-700 text-sm md:text-base leading-relaxed italic mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              {/* Author */}
              <div className="flex items-center justify-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <div className="font-semibold text-sm text-ink-900">{t.name}</div>
                  <div className="text-xs text-ink-500">{t.role}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center text-ink-500 hover:bg-ink-50 hover:text-brand-primary transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1.5">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === current ? 'bg-brand-primary' : 'bg-ink-200'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center text-ink-500 hover:bg-ink-50 hover:text-brand-primary transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
