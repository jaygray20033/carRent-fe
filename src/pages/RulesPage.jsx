// src/pages/RulesPage.jsx — Day 36. Figma: Rule.png
// Static "Điều khoản và Nghĩa vụ của các bên" contract-terms prose page.
import { Link } from 'react-router-dom';
import { ChevronRight, ScrollText } from 'lucide-react';

const SECTIONS = [
  {
    heading: 'I. Nghĩa vụ của Bên cho thuê (OtoRent)',
    items: [
      'Giao xe đúng loại, đúng thời gian và địa điểm đã thỏa thuận trong hợp đồng.',
      'Bảo đảm xe trong tình trạng kỹ thuật tốt, đầy đủ giấy tờ hợp lệ (đăng ký, đăng kiểm, bảo hiểm).',
      'Cung cấp hỗ trợ kỹ thuật và cứu hộ 24/7 trong suốt thời gian thuê.',
      'Hoàn trả tiền đặt cọc đầy đủ khi khách trả xe đúng hạn và không phát sinh hư hỏng.',
    ],
  },
  {
    heading: 'II. Nghĩa vụ của Bên thuê (Khách hàng)',
    items: [
      'Xuất trình đầy đủ giấy tờ hợp lệ và thực hiện đặt cọc theo quy định trước khi nhận xe.',
      'Sử dụng xe đúng mục đích, không cho thuê lại, không sử dụng vào hoạt động trái pháp luật.',
      'Chịu trách nhiệm với mọi vi phạm giao thông phát sinh trong thời gian thuê xe.',
      'Bảo quản xe cẩn thận, hoàn trả xe đúng hạn với mức nhiên liệu như khi nhận.',
      'Thông báo ngay cho OtoRent khi xảy ra sự cố, tai nạn hoặc hư hỏng.',
    ],
  },
  {
    heading: 'III. Đặt cọc và thanh toán',
    items: [
      'Mức đặt cọc từ 15 đến 100 triệu đồng tùy theo dòng xe, hoặc thế chấp bằng giấy tờ tương đương.',
      'Thanh toán đầy đủ chi phí thuê trước khi nhận xe qua các phương thức được hỗ trợ.',
      'Tiền cọc được hoàn trả trong vòng 1-3 ngày làm việc sau khi hoàn tất kiểm tra xe.',
    ],
  },
  {
    heading: 'IV. Chính sách hủy và bồi thường',
    items: [
      'Hủy miễn phí trước 24 giờ so với thời điểm nhận xe.',
      'Hủy trong vòng 24 giờ: khấu trừ 30% tiền đặt cọc.',
      'Hủy sau khi đã nhận xe: không hoàn tiền đặt cọc.',
      'Bồi thường hư hỏng được xác định theo biên bản bàn giao và báo giá sửa chữa thực tế.',
    ],
  },
  {
    heading: 'V. Giải quyết tranh chấp',
    items: [
      'Hai bên ưu tiên giải quyết tranh chấp thông qua thương lượng, hòa giải.',
      'Trường hợp không đạt thỏa thuận, tranh chấp được đưa ra Tòa án có thẩm quyền theo quy định pháp luật Việt Nam.',
    ],
  },
];

export default function RulesPage() {
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
            <span className="font-medium text-white">Điều khoản và nghĩa vụ</span>
          </nav>
          <p className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent">
            <ScrollText className="h-4 w-4" /> Hợp đồng thuê xe
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Điều khoản và nghĩa vụ của các bên
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Các điều khoản áp dụng cho hợp đồng thuê xe giữa OtoRent và khách hàng.
          </p>
        </div>
      </section>

      <div className="container-app py-10 lg:py-14">
        <div className="mx-auto max-w-3xl space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-3 text-lg font-bold text-ink-900">{section.heading}</h2>
              <ul className="space-y-2.5">
                {section.items.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-600">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className="border-t border-ink-100 pt-6 text-xs text-ink-400">
            Bằng việc đặt xe tại OtoRent, bạn xác nhận đã đọc, hiểu và đồng ý với toàn bộ điều khoản
            nêu trên. Xem thêm{' '}
            <Link to="/legal" className="font-medium text-brand-primary hover:underline">
              quy định và giấy tờ pháp lý
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
