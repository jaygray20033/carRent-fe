// src/pages/LegalPage.jsx — Day 36. Figma: Legal(Rules).png
// Static "Điều khoản và quy định" page: required documents + insurance types.
import { Link } from 'react-router-dom';
import { ChevronRight, FileText, Users, Building2, ShieldCheck, Check } from 'lucide-react';

const DOC_SECTIONS = [
  {
    icon: FileText,
    title: 'Giấy tờ yêu cầu',
    items: [
      'CCCD/CMND hoặc Hộ chiếu còn hiệu lực (bản gốc).',
      'Giấy phép lái xe hợp lệ, phù hợp với loại xe thuê (hạng B1/B2 trở lên).',
      'Hộ khẩu, KT3 hoặc giấy tờ tương đương để đối chiếu (khi thuê xe tự lái).',
    ],
  },
  {
    icon: Users,
    title: 'Giấy tờ đối với người nước ngoài thuê xe',
    items: [
      'Hộ chiếu còn hiệu lực kèm visa/thị thực nhập cảnh hợp lệ.',
      'Giấy phép lái xe quốc tế (IDP) hoặc GPLX Việt Nam được cấp/đổi hợp lệ.',
      'Giấy tờ xác nhận nơi lưu trú tại Việt Nam (tạm trú/khách sạn).',
    ],
  },
  {
    icon: Building2,
    title: 'Giấy tờ dành cho tổ chức / doanh nghiệp',
    items: [
      'Giấy phép đăng ký kinh doanh (bản sao công chứng).',
      'Giấy giới thiệu và CCCD của người đại diện nhận xe.',
      'Hợp đồng thuê xe ký đóng dấu pháp nhân của doanh nghiệp.',
    ],
  },
];

const INSURANCE_PLANS = [
  {
    name: 'Bảo hiểm cơ bản',
    tagline: 'Đã bao gồm trong mọi hợp đồng thuê',
    highlight: false,
    features: [
      'Bảo hiểm trách nhiệm dân sự bắt buộc.',
      'Bảo hiểm vật chất cơ bản cho xe.',
      'Hỗ trợ cứu hộ trong phạm vi nội thành.',
      'Mức miễn thường áp dụng theo hợp đồng.',
    ],
  },
  {
    name: 'Bảo hiểm toàn diện',
    tagline: 'Khuyến nghị cho chuyến đi xa',
    highlight: true,
    features: [
      'Bao gồm toàn bộ quyền lợi của gói cơ bản.',
      'Miễn hoặc giảm tối đa mức miễn thường khi xảy ra sự cố.',
      'Bảo hiểm thủy kích, cháy nổ, mất cắp bộ phận.',
      'Cứu hộ toàn quốc 24/7 và xe thay thế khi cần.',
    ],
  },
];

export default function LegalPage() {
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
            <span className="font-medium text-white">Điều khoản và quy định</span>
          </nav>
          <p className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent">
            <ShieldCheck className="h-4 w-4" /> Quy định thuê xe
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Điều khoản và quy định</h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Giấy tờ cần chuẩn bị và các loại hình bảo hiểm áp dụng cho từng dòng xe.
          </p>
        </div>
      </section>

      <div className="container-app py-10 lg:py-14">
        {/* Required documents */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {DOC_SECTIONS.map(({ icon: Icon, title, items }) => (
            <div key={title} className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mb-3 text-base font-bold text-ink-900">{title}</h2>
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-600">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Insurance types */}
        <div className="mt-12">
          <h2 className="mb-1 text-center text-2xl font-bold text-ink-900">
            Các loại hình bảo hiểm
          </h2>
          <p className="mb-8 text-center text-sm text-ink-500">
            Lựa chọn gói bảo hiểm phù hợp cho từng dòng xe và hành trình của bạn.
          </p>
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            {INSURANCE_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 shadow-card ring-1 ${
                  plan.highlight
                    ? 'bg-brand-primary text-white ring-brand-primary'
                    : 'bg-white text-ink-900 ring-ink-100'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute right-4 top-4 rounded-full bg-brand-accent px-2.5 py-0.5 text-xs font-semibold text-ink-900">
                    Khuyến nghị
                  </span>
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p
                  className={`mt-1 text-sm ${plan.highlight ? 'text-white/70' : 'text-ink-500'}`}
                >
                  {plan.tagline}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed">
                      <Check
                        className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                          plan.highlight ? 'text-brand-accent' : 'text-brand-primary'
                        }`}
                      />
                      <span className={plan.highlight ? 'text-white/90' : 'text-ink-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs text-ink-400">
          Tham khảo thêm{' '}
          <Link to="/rules" className="font-medium text-brand-primary hover:underline">
            điều khoản và nghĩa vụ của các bên
          </Link>{' '}
          trong hợp đồng thuê xe.
        </p>
      </div>
    </div>
  );
}
