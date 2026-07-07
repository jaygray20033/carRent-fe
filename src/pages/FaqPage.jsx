// src/pages/FaqPage.jsx — Day 36. Figma: FAQ.png
// Static FAQ: category groups, each an accordion of Q&A.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';

const CATEGORIES = [
  {
    title: 'Thủ tục & giấy tờ',
    items: [
      {
        q: 'Tôi cần chuẩn bị những giấy tờ gì để thuê xe?',
        a: 'Bạn cần mang theo CCCD/CMND, giấy phép lái xe (còn hiệu lực) và hộ khẩu hoặc KT3. Đối với thuê xe tự lái, cần có bằng lái B2 trở lên.',
      },
      {
        q: 'Người nước ngoài có thuê xe được không?',
        a: 'Có. Người nước ngoài cần hộ chiếu, visa còn hiệu lực và giấy phép lái xe quốc tế (IDP) hoặc bằng lái Việt Nam.',
      },
      {
        q: 'Doanh nghiệp thuê xe cần giấy tờ gì?',
        a: 'Cần giấy phép đăng ký kinh doanh, giấy giới thiệu và giấy tờ của người đại diện nhận xe.',
      },
    ],
  },
  {
    title: 'Đặt cọc & thanh toán',
    items: [
      {
        q: 'Chính sách đặt cọc của OtoRent như thế nào?',
        a: 'OtoRent yêu cầu đặt cọc từ 15-100 triệu VNĐ tùy dòng xe. Tiền cọc sẽ được hoàn trả đầy đủ khi bạn trả xe đúng hạn và xe không có hư hỏng.',
      },
      {
        q: 'OtoRent hỗ trợ những phương thức thanh toán nào?',
        a: 'Chúng tôi hỗ trợ thanh toán qua VNPay, chuyển khoản ngân hàng, ví OtoRent và tiền mặt khi nhận xe.',
      },
    ],
  },
  {
    title: 'Nhận & trả xe',
    items: [
      {
        q: 'OtoRent có giao xe tận nơi không?',
        a: 'Có! OtoRent hỗ trợ giao xe tận nơi trong nội thành TP.HCM, Hà Nội và Đà Nẵng. Phí giao xe từ 200.000 VNĐ tùy khoảng cách.',
      },
      {
        q: 'Có thể hủy đặt xe không? Phí hủy bao nhiêu?',
        a: 'Bạn có thể hủy miễn phí trước 24h. Hủy trong vòng 24h sẽ mất 30% tiền cọc. Hủy sau khi nhận xe không được hoàn cọc.',
      },
    ],
  },
  {
    title: 'Bảo hiểm & sự cố',
    items: [
      {
        q: 'Xe có được bảo hiểm không?',
        a: 'Tất cả xe tại OtoRent đều có bảo hiểm vật chất và trách nhiệm dân sự. Bạn có thể mua thêm gói bảo hiểm toàn diện với mức phí ưu đãi.',
      },
      {
        q: 'Xe gặp sự cố trên đường thì làm thế nào?',
        a: 'Hãy dùng tính năng cứu hộ (SOS) trong ứng dụng hoặc gọi hotline. Trạm cứu hộ gần nhất sẽ được điều phối đến hỗ trợ bạn.',
      },
    ],
  },
];

function AccordionItem({ q, a, isOpen, onToggle }) {
  return (
    <div
      className={`rounded-xl transition-all duration-200 ${
        isOpen ? 'bg-white shadow-card' : 'bg-white/60'
      }`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className={`text-sm font-medium ${isOpen ? 'text-ink-900' : 'text-ink-700'}`}>
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-ink-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && <p className="px-5 pb-4 text-sm leading-relaxed text-ink-500">{a}</p>}
    </div>
  );
}

export default function FaqPage() {
  // Track open item as "categoryIndex-itemIndex"; first item open by default.
  const [open, setOpen] = useState('0-0');

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
            <span className="font-medium text-white">Câu hỏi thường gặp</span>
          </nav>
          <p className="mb-1 text-sm font-semibold text-brand-accent">Hỗ trợ khách hàng</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Câu hỏi thường gặp</h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Những thắc mắc phổ biến nhất về dịch vụ thuê xe tại OtoRent.
          </p>
        </div>
      </section>

      <div className="container-app py-10 lg:py-14">
        <div className="mx-auto max-w-3xl space-y-8">
          {CATEGORIES.map((cat, ci) => (
            <div key={cat.title}>
              <h2 className="mb-3 text-lg font-bold text-ink-900">{cat.title}</h2>
              <div className="space-y-3">
                {cat.items.map((item, ii) => {
                  const key = `${ci}-${ii}`;
                  return (
                    <AccordionItem
                      key={key}
                      q={item.q}
                      a={item.a}
                      isOpen={open === key}
                      onToggle={() => setOpen(open === key ? '' : key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          <div className="rounded-2xl bg-brand-primary/5 p-6 text-center ring-1 ring-brand-primary/10">
            <h3 className="mb-1 text-base font-bold text-ink-900">Vẫn chưa tìm được câu trả lời?</h3>
            <p className="mb-4 text-sm text-ink-500">
              Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp bạn.
            </p>
            <Link to="/contact" className="btn btn-primary btn-md">
              Liên hệ với chúng tôi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
