// src/hooks/usePortalAccess.js
// Detects which staff/partner portals the signed-in user may enter, so the
// public Header can surface a "go to my dashboard" link. Reuses the exact
// endpoints the route guards use (SupplierRoute / EnterpriseRoute) and the
// admin role check (AdminRoute), so what the Header shows always matches what
// the guards actually allow.
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Truck, Building2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { supplierPortalService } from '../services/supplierService.js';
import { enterpriseService } from '../services/enterpriseService.js';

const ADMIN_ROLES = ['ADMIN', 'OPERATOR'];

export function usePortalAccess() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const enabled = !!accessToken;

  const roleCode = user?.role?.code || user?.role;
  const isAdmin = ADMIN_ROLES.includes(roleCode);

  // Most signed-in users are plain renters, so these probes usually come back
  // empty/403 — that just means "no portal". Probe once per session, cache long,
  // never retry, and stay silent on error. Admins skip the partner probes.
  const { data: supplierData } = useQuery({
    queryKey: ['portal-access', 'supplier'],
    queryFn: () => supplierPortalService.me(),
    enabled: enabled && !isAdmin,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const { data: enterpriseData } = useQuery({
    queryKey: ['portal-access', 'enterprise'],
    queryFn: () => enterpriseService.myCompany(),
    enabled: enabled && !isAdmin,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const supplierPayload = supplierData?.data ?? supplierData ?? {};
  const isSupplier = Boolean(
    supplierPayload.supplier?.id && supplierPayload.membership?.isActive
  );

  const enterprisePayload = enterpriseData?.data ?? enterpriseData ?? {};
  const isEnterprise = Boolean(
    enterprisePayload.company?.id ||
      enterprisePayload.corporate?.id ||
      enterprisePayload.membership?.corporateId
  );

  const portals = [];
  if (isAdmin) portals.push({ to: '/admin', label: 'Trang quản trị', icon: LayoutDashboard });
  if (isSupplier) portals.push({ to: '/supplier', label: 'Cổng nhà cung cấp', icon: Truck });
  if (isEnterprise)
    portals.push({ to: '/enterprise', label: 'Cổng doanh nghiệp', icon: Building2 });

  return { isAdmin, isSupplier, isEnterprise, portals };
}

export default usePortalAccess;
