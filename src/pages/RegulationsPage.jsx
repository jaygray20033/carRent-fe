// src/pages/RegulationsPage.jsx — Quy chế hoạt động sàn (static prose).
import { Link } from 'react-router-dom';
import { ChevronRight, Landmark } from 'lucide-react';

const SECTIONS = [
  {
    heading: 'I. Giới thiệu chung',
    items: [
      'CarGoGo là nền tảng kết nối khách hàng có nhu cầu thuê xe với các nhà cung cấp xe và đối tác vận tải.',
      'Quy chế này áp dụng cho toàn bộ thành viên tham gia giao dịch trên nền tảng.',
      'Việc sử dụng nền tảng đồng nghĩa với việc bạn chấp thuận các quy định nêu trong quy chế này.',
    ],
  },
  {
    heading: 'II. Đối tượng tham gia',
    items: [
      'Khách hàng: cá nhân hoặc tổ chức có nhu cầu thuê xe, đã đăng ký tài khoản hợp lệ.',
      'Nhà cung cấp xe: cá nhân, doanh nghiệp sở hữu xe và đăng ký cho thuê qua nền tảng.',
      'Đối tác doanh nghiệp: tổ chức sử dụng dịch vụ thuê xe theo hợp đồng dài hạn.',
    ],
  },
  {
    heading: 'III. Nguyên tắc hoạt động',
    items: [
      'Mọi giao dịch được thực hiện minh bạch, trên cơ sở tự nguyện và tuân thủ pháp luật.',
      'CarGoGo đóng vai trò trung gian, hỗ trợ kết nối và đảm bảo quyền lợi các bên.',
      'Thông tin xe, giá thuê và điều kiện thuê được niêm yết công khai trước khi giao dịch.',
      'Các bên có trách nhiệm cung cấp thông tin chính xác và thực hiện đúng cam kết.',
    ],
  },
  {
    heading: 'IV. Quyền và trách nhiệm của nền tảng',
    items: [
      'Cung cấp hạ tầng kỹ thuật ổn định, bảo mật cho các giao dịch.',
      'Kiểm duyệt thông tin xe và nhà cung cấp trước khi đăng tải.',
      'Hỗ trợ giải quyết tranh chấp phát sinh giữa các bên.',
      'Có quyền tạm khóa hoặc chấm dứt tài khoản vi phạm quy chế hoặc pháp luật.',
    ],
  },
  {
    heading: 'V. Quy định xử lý vi phạm',
    items: [
      'Cảnh báo hoặc tạm khóa tài khoản đối với hành vi cung cấp thông tin sai lệch.',
      'Chấm dứt hợp tác với đối tác vi phạm nghiêm trọng hoặc nhiều lần.',
      'Chuyển cơ quan chức năng xử lý đối với hành vi có dấu hiệu vi phạm pháp luật.',
    ],
  },
];

export default function RegulationsPage() {
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
            <span className="font-medium text-brand-accent">Quy chế hoạt động</span>
          </nav>
          <p className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent">
            <Landmark className="h-4 w-4" /> Quy chế sàn
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Quy chế hoạt động</h1>
          <p className="mt-2 max-w-xl text-sm text-white/85">
            Nguyên tắc vận hành nền tảng và quyền, trách nhiệm của các bên tham gia.
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
            Xem thêm{' '}
            <Link to="/rules" className="font-medium text-brand-primary hover:underline">
              điều khoản và nghĩa vụ của các bên
            </Link>{' '}
            trong hợp đồng thuê xe.
          </p>
        </div>
      </div>
    </div>
  );
}
