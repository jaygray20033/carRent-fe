// src/components/layout/AdminLayout.jsx
// Admin dashboard layout with left sidebar nav (UC-56/57).
// No Figma for admin — built from the Design System tokens (brand/ink, radius, shadow).
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Layers,
  ClipboardList,
  Users,
  FileText,
  FolderTree,
  Tags,
  MessageSquare,
  TicketPercent,
  BarChart3,
  Settings,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

const navItems = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/admin/vehicles', label: 'Quản lý xe', icon: Car },
  { to: '/admin/vehicle-models', label: 'Dòng xe', icon: Layers },
  { to: '/admin/bookings', label: 'Đơn thuê', icon: ClipboardList },
  { to: '/admin/users', label: 'Người dùng', icon: Users },
  { to: '/admin/posts', label: 'Bài viết', icon: FileText },
  { to: '/admin/post-categories', label: 'Danh mục', icon: FolderTree },
  { to: '/admin/tags', label: 'Thẻ', icon: Tags },
  { to: '/admin/comments', label: 'Duyệt bình luận', icon: MessageSquare },
  { to: '/admin/coupons', label: 'Mã giảm giá', icon: TicketPercent },
  { to: '/admin/reports', label: 'Báo cáo', icon: BarChart3 },
  { to: '/admin/settings', label: 'Cài đặt', icon: Settings },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const displayName = user?.fullName || 'Quản trị viên';
  const roleName = user?.role?.name || user?.role?.code || 'ADMIN';

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6">
            {/* Brand */}
            <div className="flex items-center gap-2 px-3 pb-4">
              <span className="text-lg font-extrabold text-brand-primary">OtoRent</span>
              <span className="rounded-md bg-brand-primary/10 px-1.5 py-0.5 text-xs font-semibold text-brand-primary">
                Admin
              </span>
            </div>

            <nav className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-ink-100">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-brand-primary/10 font-semibold text-brand-primary'
                        : 'text-ink-500 hover:bg-ink-50'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-4 overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-ink-100">
              <NavLink
                to="/"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-500 transition-colors hover:bg-ink-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Về trang chủ
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/5"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          {/* Mobile top bar */}
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-ink-100 lg:hidden">
            <span className="font-extrabold text-brand-primary">OtoRent Admin</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-danger"
            >
              Đăng xuất
            </button>
          </div>

          {/* Mobile nav */}
          <nav className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                    isActive
                      ? 'bg-brand-primary text-white'
                      : 'bg-white text-ink-500 ring-1 ring-ink-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User strip (desktop) */}
          <div className="mb-4 hidden items-center justify-between lg:flex">
            <div />
            <div className="text-right text-sm">
              <p className="font-semibold text-ink-700">{displayName}</p>
              <p className="text-xs text-ink-300">{roleName}</p>
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
