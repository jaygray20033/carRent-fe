import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, User, CalendarDays, Wallet, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import useUiStore from '../../store/uiStore.js';

const NAV_ITEMS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/cars?type=SELF_DRIVE', label: 'Thuê xe tự lái' },
  { to: '/cars?type=WITH_DRIVER', label: 'Thuê xe có tài xế' },
  { to: '/magazine', label: 'Tạp chí' },
  { to: '/contact', label: 'Liên hệ' },
];

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const openAuthModal = useUiStore((s) => s.openAuthModal);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const navActiveClass = ({ isActive }) =>
    `text-sm font-medium px-1 py-2 transition-colors whitespace-nowrap ${
      isActive ? 'text-brand-primary' : 'text-ink-700 hover:text-brand-primary'
    }`;

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
          scrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <div className="container-app flex items-center justify-between h-[68px]">
          {/* ── Left side: Login / User ── */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <button
                onClick={() => openAuthModal('login')}
                className="btn btn-primary btn-sm hidden md:inline-flex"
              >
                Đăng nhập
              </button>
            ) : (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-brand-primary transition"
                >
                  <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center overflow-hidden border-2 border-brand-accent">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-brand-primary" />
                    )}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.fullName || 'User'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {userMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-ink-100 py-2 z-50 animate-fade-in">
                    <Link
                      to="/me"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition"
                    >
                      <User className="w-4 h-4 text-ink-500" /> Tài khoản
                    </Link>
                    <Link
                      to="/me/bookings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition"
                    >
                      <CalendarDays className="w-4 h-4 text-ink-500" /> Đơn đặt xe
                    </Link>
                    <Link
                      to="/me/wallet"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition"
                    >
                      <Wallet className="w-4 h-4 text-ink-500" /> Ví của tôi
                    </Link>
                    <hr className="my-1.5 border-ink-100" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-red-50 w-full transition"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Search icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-ink-500 hover:text-brand-primary transition"
              aria-label="Tìm kiếm"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* ── Center: Navigation ── */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navActiveClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* ── Right side: Logo ── */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-ink-900">Oto</span>
              <span className="text-brand-primary">Rent</span>
            </span>
            <div className="w-9 h-9 rounded-full bg-brand-accent flex items-center justify-center shadow-sm">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 17h2m10 0h2M6 12h12M7 7h10l2 5H5l2-5z" />
                <circle cx="7.5" cy="17" r="1.5" />
                <circle cx="16.5" cy="17" r="1.5" />
              </svg>
            </div>
          </Link>

          {/* ── Mobile menu button ── */}
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-ink-700 -mr-1">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* ═══ Mobile Drawer ═══ */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-ink-100">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                <span className="text-lg font-bold">
                  <span className="text-ink-900">Oto</span>
                  <span className="text-brand-primary">Rent</span>
                </span>
                <div className="w-7 h-7 rounded-full bg-brand-accent flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 17h2m10 0h2M6 12h12M7 7h10l2 5H5l2-5z" />
                    <circle cx="7.5" cy="17" r="1.5" />
                    <circle cx="16.5" cy="17" r="1.5" />
                  </svg>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-ink-500 hover:text-ink-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-3 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-6 py-3.5 text-sm font-medium transition ${
                      isActive
                        ? 'text-brand-primary bg-blue-50/80 border-r-3 border-brand-primary'
                        : 'text-ink-700 hover:bg-ink-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-ink-100">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center border-2 border-brand-accent">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-brand-primary" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-ink-700">{user?.fullName}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="btn btn-outline btn-sm w-full"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    openAuthModal('login');
                  }}
                  className="btn btn-primary btn-md w-full"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Search Overlay ═══ */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-fade-in">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-ink-100">
              <Search className="w-5 h-5 text-ink-300 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Tìm kiếm xe, thương hiệu, model..."
                className="flex-1 text-base text-ink-900 placeholder:text-ink-300 border-0 outline-none bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    navigate(`/cars?q=${encodeURIComponent(e.target.value.trim())}`);
                    setSearchOpen(false);
                  }
                  if (e.key === 'Escape') setSearchOpen(false);
                }}
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1.5 text-ink-400 hover:text-ink-700 rounded-lg hover:bg-ink-50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-3 text-xs text-ink-300">
              Nhấn{' '}
              <kbd className="px-1.5 py-0.5 bg-ink-50 rounded text-ink-500 font-medium">Enter</kbd>{' '}
              để tìm kiếm &bull;{' '}
              <kbd className="px-1.5 py-0.5 bg-ink-50 rounded text-ink-500 font-medium">Esc</kbd> để
              đóng
            </div>
          </div>
        </div>
      )}
    </>
  );
}
