// src/components/layout/UserLayout.jsx
// User account dashboard shell — left sidebar + right content card.
// Matches Figma UserAccount-*.png (profile block, menu, red logout w/ modal).
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Wallet,
  CalendarClock,
  MapPin,
  Receipt,
  Star,
  LogOut,
  Pencil,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { authService } from '../../services/authService.js';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

const navItems = [
  { to: '/me/wallet', label: 'Ví tiền', icon: Wallet },
  { to: '/me/bookings', label: 'Lịch đặt xe', icon: CalendarClock },
  { to: '/me/addresses', label: 'Địa chỉ của tôi', icon: MapPin },
  { to: '/me/payments', label: 'Lịch sử thanh toán', icon: Receipt },
  { to: '/me/reviews', label: 'Đánh giá', icon: Star },
];

export default function UserLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const displayName = user?.fullName || user?.name || 'Người dùng';
  const phone = user?.phone || '';
  const avatar =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=004ede&color=fff`;

  const handleLogout = async () => {
    // Best-effort server-side revoke; clear local session regardless.
    try {
      await authService.logout(refreshToken);
    } catch {
      /* ignore — local clear below is what matters */
    }
    clearAuth();
    navigate('/login');
  };

  const itemClass = ({ isActive }) =>
    `flex items-center justify-between rounded-xl px-3 py-3 text-sm transition-colors ${
      isActive
        ? 'bg-brand-primary/10 font-semibold text-brand-primary'
        : 'text-ink-500 hover:bg-ink-50'
    }`;

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:h-fit lg:w-72">
            {/* Profile block → links to /me (Thông tin người dùng) */}
            <NavLink
              to="/me"
              end
              className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink-100"
            >
              <img
                src={avatar}
                alt={displayName}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink-900">{displayName}</p>
                {phone && <p className="text-xs text-ink-400">{phone}</p>}
              </div>
              <span className="rounded-lg p-2 text-brand-primary" title="Chỉnh sửa hồ sơ">
                <Pencil className="h-4 w-4" />
              </span>
            </NavLink>

            {/* Menu */}
            <nav className="mt-4 rounded-2xl bg-white p-2 shadow-card ring-1 ring-ink-100">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={itemClass}>
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-ink-200" />
                </NavLink>
              ))}

              <div className="my-1 border-t border-ink-100" />

              <button
                type="button"
                onClick={() => setLogoutOpen(true)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-danger transition-colors hover:bg-danger/10"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </nav>
          </aside>

          {/* Content */}
          <section className="min-w-0 flex-1">
            <Outlet />
          </section>
        </div>
      </div>

      {/* Logout confirmation (Figma: UserAccount-Logout.png) */}
      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Đăng xuất" size="sm">
        <p className="text-sm text-ink-500">
          Bạn có chắc muốn đăng xuất khỏi tài khoản của mình không?
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="danger" onClick={handleLogout}>
            Đăng xuất
          </Button>
          <Button variant="outline" onClick={() => setLogoutOpen(false)}>
            Hủy bỏ
          </Button>
        </div>
      </Modal>
    </div>
  );
}
