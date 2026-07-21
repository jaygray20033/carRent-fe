// src/components/auth/SupplierRoute.jsx
// Marketplace Phase E — only active supplier members may enter /supplier/*.
// Mirrors EnterpriseRoute: probes /supplier/me and passes membership + supplier
// down via the layout Outlet context.
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { supplierPortalService } from '../../services/supplierService.js';
import Loading from '../common/Loading.jsx';

export default function SupplierRoute({ children }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const location = useLocation();
  const [state, setState] = useState({ loading: true, allowed: false, data: null });

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!accessToken) {
        if (!cancelled) setState({ loading: false, allowed: false, data: null });
        return;
      }
      try {
        const res = await supplierPortalService.me();
        const payload = res?.data ?? res ?? {};
        const membership = payload.membership || {};
        const supplier = payload.supplier || {};
        if (!cancelled) {
          setState({
            loading: false,
            allowed: Boolean(supplier?.id && membership?.isActive),
            data: { membership, supplier },
          });
        }
      } catch {
        if (!cancelled) setState({ loading: false, allowed: false, data: null });
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (state.loading) return <Loading label="Đang kiểm tra quyền nhà cung cấp..." />;
  if (!state.allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-ink-100">
          <h1 className="text-xl font-bold text-ink-700">403 — Không có quyền</h1>
          <p className="mt-2 text-sm text-ink-500">
            Tài khoản của bạn chưa thuộc nhà cung cấp nào. Cổng nhà cung cấp chỉ dành cho thành
            viên đã được OtoRent mời và kích hoạt.
          </p>
          <a href="/" className="mt-4 inline-block text-sm font-semibold text-brand-primary">
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }
  return children;
}
