import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

// Inline SVG social icons (lucide-react removed brand icons)
const LinkedinIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const InstagramIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);
const FacebookIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const TwitterIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FOOTER_LINKS = {
  info: {
    title: 'Thông tin',
    items: [
      { label: 'Giới thiệu', to: '/about' },
      { label: 'Chính sách bảo mật', to: '/privacy' },
      { label: 'Điều khoản dịch vụ', to: '/terms' },
      { label: 'Quy chế hoạt động', to: '/regulations' },
    ],
  },
  support: {
    title: 'Hỗ trợ',
    items: [
      { label: 'Hướng dẫn thuê xe', to: '/guide' },
      { label: 'Câu hỏi thường gặp', to: '/faq' },
      { label: 'Phương thức thanh toán', to: '/payment-methods' },
      { label: 'Hỗ trợ khách hàng', to: '/support' },
    ],
  },
};

// Fallback contact info (API /site-settings/contact sẽ replace ở Day 36)
const CONTACT = {
  phone: '0986310849',
  email: 'contact@vflash.com.vn',
  address: '55 Đặng Nhữ Mai, Phường Cát Lái,\nThành Phố Hồ Chí Minh, Việt Nam',
  hours: 'Thứ 2 - Thứ 7 | 8:00 AM - 5:20 PM',
};

const SOCIALS = [
  { icon: LinkedinIcon, href: 'https://linkedin.com/company/otorent', label: 'LinkedIn' },
  { icon: InstagramIcon, href: 'https://instagram.com/otorent.vn', label: 'Instagram' },
  { icon: FacebookIcon, href: 'https://facebook.com/otorent.vn', label: 'Facebook' },
  { icon: TwitterIcon, href: 'https://twitter.com/otorent', label: 'Twitter' },
];

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-white mt-0">
      <div className="container-app py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6">
          {/* ── Col 1: Logo + About + Socials ── */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-brand-accent flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17h2m10 0h2M6 12h12M7 7h10l2 5H5l2-5z" />
                  <circle cx="7.5" cy="17" r="1.5" />
                  <circle cx="16.5" cy="17" r="1.5" />
                </svg>
              </div>
              <span className="text-xl font-bold">
                <span className="text-white">Oto</span>
                <span className="text-brand-accent">Rent</span>
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed mb-5 max-w-xs">
              OtoRent với phương châm đặt niềm tin của khách hàng lên hàng đầu, tự hào sở hữu đội ngũ xe lớn nhất bao gồm đa dạng các dòng xe từ xe đời mới chạy ít km, xe tiết kiệm cho đến xe thương mại. Chúng tôi luôn sẵn sàng phục vụ và cung cấp dịch vụ trên toàn lãnh thổ Việt Nam.
            </p>
            <div className="flex items-center gap-2.5">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-brand-accent/90 flex items-center justify-center transition-colors duration-200"
                >
                  <Icon className="w-4.5 h-4.5 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2: Liên hệ ── */}
          <div className="lg:col-span-3">
            <h4 className="text-base font-semibold text-white mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-accent" />
                <a href={`tel:${CONTACT.phone}`} className="hover:text-white transition">{CONTACT.phone}</a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-accent" />
                <a href={`mailto:${CONTACT.email}`} className="hover:text-white transition">{CONTACT.email}</a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-accent" />
                <span className="whitespace-pre-line">{CONTACT.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-accent" />
                <span>{CONTACT.hours}</span>
              </li>
            </ul>
          </div>

          {/* ── Col 3 & 4: Links ── */}
          {Object.values(FOOTER_LINKS).map(({ title, items }) => (
            <div key={title} className="lg:col-span-2">
              <h4 className="text-base font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {items.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-white/60 hover:text-brand-accent transition">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* ── Col 5: Newsletter (Đăng ký) ── */}
          <div className="lg:col-span-1 hidden lg:block" />
        </div>

        {/* Newsletter row — full width on smaller, col on lg */}
        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 max-w-md">
            <h4 className="text-base font-semibold text-white mb-1">Đăng ký</h4>
            <p className="text-sm text-white/50 mb-3">
              Nhập email của bạn để nhận những thông tin mới nhất.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); }}
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="Email"
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent transition"
              />
              <button
                type="submit"
                className="btn bg-brand-accent text-ink-900 font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-accent-dark transition text-sm whitespace-nowrap"
              >
                Gửi đi
              </button>
            </form>
          </div>
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} OtoRent. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
