// src/pages/PrivacyPage.jsx — Chính sách bảo mật (static prose).
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck } from 'lucide-react';

const SECTIONS = [
  {
    heading: 'I. Thông tin chúng tôi thu thập',
    items: [
      'Thông tin định danh: họ tên, số CCCD/CMND/hộ chiếu, giấy phép lái xe khi bạn đăng ký và thuê xe.',
      'Thông tin liên hệ: số điện thoại, email, địa chỉ nhận và trả xe.',
      'Thông tin thanh toán: lịch sử giao dịch, phương thức thanh toán (không lưu trữ số thẻ đầy đủ).',
      'Dữ liệu sử dụng: lịch sử đặt xe, đánh giá, thao tác trên nền tảng để cải thiện dịch vụ.',
    ],
  },
  {
    heading: 'II. Mục đích sử dụng thông tin',
    items: [
      'Xác thực danh tính và xử lý hợp đồng thuê xe của bạn.',
      'Liên hệ xác nhận đơn hàng, giao nhận xe và hỗ trợ trong suốt thời gian thuê.',
      'Xử lý thanh toán, hoàn cọc và giải quyết khiếu nại, tranh chấp.',
      'Gửi thông báo về ưu đãi, dịch vụ mới khi bạn đồng ý nhận tin.',
    ],
  },
  {
    heading: 'III. Chia sẻ thông tin',
    items: [
      'CarGoGo không bán, trao đổi thông tin cá nhân của bạn cho bên thứ ba vì mục đích thương mại.',
      'Thông tin chỉ được chia sẻ với đối tác cung cấp xe, cổng thanh toán và cơ quan chức năng khi có yêu cầu hợp pháp.',
      'Mọi đối tác xử lý dữ liệu đều cam kết bảo mật theo quy định pháp luật Việt Nam.',
    ],
  },
  {
    heading: 'IV. Bảo mật và lưu trữ',
    items: [
      'Dữ liệu được mã hóa khi truyền tải và lưu trữ trên hệ thống có kiểm soát truy cập.',
      'Thông tin được lưu giữ trong thời gian cần thiết để thực hiện dịch vụ và tuân thủ nghĩa vụ pháp lý.',
      'Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để ngăn chặn truy cập trái phép.',
    ],
  },
  {
    heading: 'V. Quyền của bạn',
    items: [
      'Yêu cầu truy cập, chỉnh sửa hoặc cập nhật thông tin cá nhân của mình.',
      'Yêu cầu xóa dữ liệu khi không còn nghĩa vụ pháp lý phải lưu giữ.',
      'Từ chối nhận thông tin tiếp thị bất cứ lúc nào.',
      'Liên hệ bộ phận hỗ trợ để thực hiện các quyền nêu trên.',
    ],
  },
];

export default function PrivacyPage() {
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
            <span className="font-medium text-brand-accent">Chính sách bảo mật</span>
          </nav>
          <p className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent">
            <ShieldCheck className="h-4 w-4" /> Quyền riêng tư
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Chính sách bảo mật</h1>
          <p className="mt-2 max-w-xl text-sm text-white/85">
            Cách CarGoGo thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.
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
            Chính sách này có thể được cập nhật định kỳ. Nếu có thắc mắc về quyền riêng tư, vui lòng{' '}
            <Link to="/contact" className="font-medium text-brand-primary hover:underline">
              liên hệ với chúng tôi
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
