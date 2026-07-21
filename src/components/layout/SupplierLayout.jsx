// src/components/layout/SupplierLayout.jsx
// Marketplace Phase E — dedicated Supplier Portal shell (white-label: the
// supplier never sees the corporate client identity or OtoRent's margin).
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Wallet,
  Bell,
  LogOut,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { supplierPortalService } from '../../services/supplierService.js';

const navItems = [
  { to: '/supplier', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/supplier/bookings', label: 'Chuyến điều phối', icon: ClipboardList },
  { to: '/supplier/settlements', label: 'Payout / Thanh toán', icon: Wallet },
  { to: '/supplier/members', label: 'Tài xế & thành viên', icon: Users, adminOnly: true },
];

export default function SupplierLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const { data } = useQuery({
    queryKey: ['supplier', 'me'],
    queryFn: () => supplierPortalService.me(),
  });
  const payload = data?.data ?? data ?? {};
  const membership = payload.membership || {};
  const supplier = payload.supplier || {};
  const isAdmin = Boolean(membership.isAdmin);
  const risk = Boolean(supplier.terminationRisk);

  const items = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6 space-y-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink-100">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-brand-primary" />
                <span className="text-lg font-extrabold text-brand-primary">OtoRent</span>
                <span className="rounded-md bg-brand-primary/10 px-1.5 py-0.5 text-xs font-semibold text-brand-primary">
                  NCC
                </span>
              </div>
              <div className="mt-2 text-sm font-semibold text-ink-700">
                {supplier.name || 'Nhà cung cấp'}
              </div>
              <div className="text-xs text-ink-400">HĐ: {supplier.contractRef || '—'}</div>
            </div>

            <nav className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-ink-100">
              {items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-ink-600 hover:bg-ink-50'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-ink-100">
            <div>
              <div className="text-sm font-semibold text-ink-700">
                {user?.fullName || membership?.fullName || 'Thành viên'}
              </div>
              <span
                className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'
                }`}
              >
                {isAdmin ? 'Supplier Admin' : 'Tài xế'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/me/notifications')}
                className="rounded-full p-2 text-ink-500 hover:bg-ink-50"
                aria-label="Thông báo"
              >
                <Bell className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAuth();
                  navigate('/login');
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-ink-100 px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-200"
              >
                <LogOut className="h-4 w-4" /> Đăng xuất
              </button>
            </div>
          </header>

          {/* Mobile nav */}
          <nav className="flex gap-2 overflow-x-auto lg:hidden">
            {items.map(({ to, label, end }) => (
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

          {risk && (
            <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                Nhà cung cấp đang có rủi ro chấm dứt hợp đồng do vi phạm CRITICAL. Vui lòng liên hệ
                OtoRent để xử lý.
              </div>
            </div>
          )}

          <Outlet context={{ membership, supplier, isAdmin }} />
        </div>
      </div>
    </div>
  );
}
