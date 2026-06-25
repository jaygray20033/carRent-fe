// src/components/layout/UserLayout.jsx
// User account layout with left sidebar (matches Figma: UserAccount-*.png)
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
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const displayName = user?.fullName || user?.name || 'Người dùng';
  const phone = user?.phone || '';
  const avatar =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1e3a8a&color=fff`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-72">
          {/* Profile card */}
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <img
              src={avatar}
              alt={displayName}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-900">{displayName}</p>
              {phone && <p className="text-xs text-gray-500">{phone}</p>}
            </div>
            <NavLink
              to="/me"
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
              title="Chỉnh sửa hồ sơ"
            >
              <Pencil className="h-4 w-4" />
            </NavLink>
          </div>

          {/* Nav menu */}
          <nav className="mt-4 overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-100">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3 py-3 text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 font-semibold text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </NavLink>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <span className="flex items-center gap-3">
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </span>
            </button>
          </nav>
        </aside>

        {/* Content */}
        <section className="min-w-0 flex-1">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
