import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

/**
 * Section 8 — FAQs + portrait
 * Yellow block, accordion câu hỏi
 */
const FAQS = [
  {
    q: 'Tôi cần chuẩn bị những giấy tờ gì để thuê xe?',
    a: 'Bạn cần mang theo CCCD/CMND, giấy phép lái xe (còn hiệu lực) và hộ khẩu hoặc KT3. Đối với thuê xe tự lái, cần có bằng lái B2 trở lên.',
  },
  {
    q: 'Chính sách đặt cọc của OtoRent như thế nào?',
    a: 'OtoRent yêu cầu đặt cọc từ 15-100 triệu VNĐ tùy dòng xe. Tiền cọc sẽ được hoàn trả đầy đủ khi bạn trả xe đúng hạn và xe không có hư hỏng.',
  },
  {
    q: 'Có thể hủy đặt xe không? Phí hủy bao nhiêu?',
    a: 'Bạn có thể hủy miễn phí trước 24h. Hủy trong vòng 24h sẽ mất 30% tiền cọc. Hủy sau khi nhận xe không được hoàn cọc.',
  },
  {
    q: 'OtoRent có giao xe tận nơi không?',
    a: 'Có! OtoRent hỗ trợ giao xe tận nơi trong nội thành TP.HCM, Hà Nội và Đà Nẵng. Phí giao xe từ 200.000 VNĐ tùy khoảng cách.',
  },
  {
    q: 'Xe có được bảo hiểm không?',
    a: 'Tất cả xe tại OtoRent đều có bảo hiểm vật chất và trách nhiệm dân sự. Bạn có thể mua thêm gói bảo hiểm toàn diện với mức phí ưu đãi.',
  },
];

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="py-14 md:py-20 bg-brand-accent/10">
      <div className="container-app">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left: FAQ title + portrait */}
          <div>
            <p className="text-brand-primary font-semibold text-sm mb-2">
              Những câu hỏi thường gặp từ khách hàng mới
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-ink-900 mb-4">
              Câu hỏi thường gặp <span className="text-brand-accent-dark">(FAQ)</span>
            </h2>
            <p className="text-sm text-ink-500 mb-6 leading-relaxed">
              Nếu bạn mới sử dụng OtoRent và có nhiều thắc mắc, hãy xem những câu hỏi dưới đây. Nếu
              vẫn chưa tìm được câu trả lời, đừng ngần ngại liên hệ chúng tôi.
            </p>
            {/* Portrait illustration */}
            <div className="hidden lg:block">
              <div className="w-48 h-48 rounded-2xl bg-brand-accent/20 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                  alt="Customer support"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right: Accordion */}
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`rounded-xl overflow-hidden transition-all duration-200 ${
                  openIdx === i ? 'bg-white shadow-card' : 'bg-white/60'
                }`}
              >
                <button
                  onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle
                      className={`w-5 h-5 flex-shrink-0 ${openIdx === i ? 'text-brand-primary' : 'text-ink-400'}`}
                    />
                    <span
                      className={`text-sm font-medium ${openIdx === i ? 'text-ink-900' : 'text-ink-700'}`}
                    >
                      {faq.q}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 text-ink-400 transition-transform duration-200 ${
                      openIdx === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIdx === i && (
                  <div className="px-5 pb-4 pl-13">
                    <p className="text-sm text-ink-500 leading-relaxed pl-8">{faq.a}</p>
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
