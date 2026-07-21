// src/components/auth/EnterpriseRoute.jsx
// ENT-Day 4 — only active corporate employees may enter /enterprise/*
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { enterpriseService } from '../../services/enterpriseService.js';
import Loading from '../common/Loading.jsx';

export default function EnterpriseRoute({ children }) {
  const { accessToken } = useAuthStore();
  const location = useLocation();
  const [state, setState] = useState({ loading: true, allowed: false, membership: null });

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!accessToken) {
        if (!cancelled) setState({ loading: false, allowed: false, membership: null });
        return;
      }
      try {
        const res = await enterpriseService.myCompany();
        const data = res?.data ?? res ?? {};
        // BE returns { membership, company }
        const membership = data.membership || data.employee || data;
        const corporate = data.company || data.corporate || membership?.corporate;
        if (!cancelled) {
          setState({
            loading: false,
            allowed: Boolean(corporate?.id || membership?.corporateId),
            membership: { ...membership, corporate },
          });
        }
      } catch {
        if (!cancelled) setState({ loading: false, allowed: false, membership: null });
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
  if (state.loading) return <Loading label="Đang kiểm tra quyền doanh nghiệp..." />;
  if (!state.allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-ink-100">
          <h1 className="text-xl font-bold text-ink-700">403 — Không có quyền</h1>
          <p className="mt-2 text-sm text-ink-500">
            Tài khoản của bạn không thuộc doanh nghiệp nào. Enterprise Portal chỉ dành cho nhân viên
            đã được mời vào hợp đồng B2B.
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
