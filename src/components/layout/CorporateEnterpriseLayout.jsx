// src/components/layout/CorporateEnterpriseLayout.jsx
// ENT-Day 4 — dedicated Enterprise Portal shell (NOT CorporateLayout / MainLayout).
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarDays,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Users,
  Bell,
  LogOut,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { enterpriseService } from '../../services/enterpriseService.js';
import SLABanner from '../enterprise/SLABanner.jsx';

const navItems = [
  { to: '/enterprise/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/enterprise/new-booking', label: 'Đặt chuyến', icon: CalendarPlus },
  { to: '/enterprise/schedule', label: 'Lịch chuyến', icon: CalendarDays },
  { to: '/enterprise/vas', label: 'Dịch vụ gia tăng', icon: Sparkles },
  { to: '/enterprise/quality', label: 'Tiêu chuẩn chất lượng', icon: ShieldCheck },
  { to: '/enterprise/settlements', label: 'Quyết toán', icon: FileSpreadsheet },
  { to: '/enterprise/contract', label: 'Hợp đồng & Phụ lục', icon: FileText },
  { to: '/enterprise/employees', label: 'Nhân viên', icon: Users },
];

export default function CorporateEnterpriseLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const { data } = useQuery({
    queryKey: ['enterprise', 'myCompany'],
    queryFn: () => enterpriseService.myCompany(),
  });
  const payload = data?.data ?? data ?? {};
  // BE: { membership, company }
  const corporate = payload.company || payload.corporate || {};
  const employee = payload.membership || payload.employee || {};
  const isAdmin = Boolean(employee.isAdmin);
  const risk = Boolean(corporate.contractTerminationRisk);

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6 space-y-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink-100">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand-primary" />
                <span className="text-lg font-extrabold text-brand-primary">OtoRent</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-ink-700">
                {corporate.name || 'Enterprise Portal'}
              </div>
              <div className="text-xs text-ink-400">HĐ: {corporate.contractRef || '—'}</div>
            </div>

            <nav className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-ink-100">
              {navItems.map(({ to, label, icon: Icon, end }) => (
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
                {user?.fullName || employee?.user?.fullName || 'Nhân viên'}
              </div>
              <span
                className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isAdmin
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-sky-100 text-sky-700'
                }`}
              >
                {isAdmin ? 'Corporate Admin' : 'Nhân viên'}
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

          {risk && (
            <SLABanner
              contractTerminationRisk
              warningMessage="Công ty đang có rủi ro chấm dứt HĐ do vi phạm CRITICAL. Liên hệ OtoRent ngay."
            />
          )}

          <Outlet context={{ corporate, employee, isAdmin }} />
        </div>
      </div>
    </div>
  );
}
