// ENT-Day 5 — block C2C routes (/cars, public bookings) for enterprise employees.
// Mounted on public C2C pages; redirects active corporate members to /enterprise/.
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { enterpriseService } from '../../services/enterpriseService.js';
import Loading from '../common/Loading.jsx';

export default function EnterpriseC2CRedirect({ children }) {
  const { accessToken } = useAuthStore();
  const [state, setState] = useState({ loading: Boolean(accessToken), isEnterprise: false });

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!accessToken) {
        if (!cancelled) setState({ loading: false, isEnterprise: false });
        return;
      }
      try {
        const res = await enterpriseService.myCompany();
        const data = res?.data ?? res ?? {};
        const corporate = data.company || data.corporate;
        const membership = data.membership || data.employee;
        const isEnterprise = Boolean(corporate?.id || membership?.corporateId);
        if (!cancelled) setState({ loading: false, isEnterprise });
      } catch {
        if (!cancelled) setState({ loading: false, isEnterprise: false });
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  if (!accessToken) return children;
  if (state.loading) return <Loading label="Đang kiểm tra..." />;
  if (state.isEnterprise) {
    return <Navigate to="/enterprise/dashboard" replace />;
  }
  return children;
}
