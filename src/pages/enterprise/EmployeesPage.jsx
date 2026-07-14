// src/pages/enterprise/EmployeesPage.jsx
import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { enterpriseService } from '../../services/enterpriseService.js';
import Loading from '../../components/common/Loading.jsx';

export default function EnterpriseEmployeesPage() {
  const { isAdmin } = useOutletContext() || {};
  const { data, isLoading } = useQuery({
    queryKey: ['enterprise', 'employees'],
    queryFn: () => enterpriseService.listEmployees({ size: 100 }),
    enabled: Boolean(isAdmin),
  });

  if (!isAdmin) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-ink-500 shadow-sm ring-1 ring-ink-100">
        Chỉ Corporate Admin quản lý nhân viên.
      </div>
    );
  }
  if (isLoading) return <Loading />;
  const raw = data?.data ?? data ?? {};
  const items = Array.isArray(raw) ? raw : raw.items || [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink-700">Nhân viên</h1>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-ink-50 text-ink-500">
            <tr>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Mã NV</th>
              <th className="px-4 py-3">Phòng ban</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.id} className="border-t border-ink-50">
                <td className="px-4 py-3">{e.user?.fullName || e.invitedEmail || '—'}</td>
                <td className="px-4 py-3 font-mono text-xs">{e.employeeCode || '—'}</td>
                <td className="px-4 py-3">{e.department || '—'}</td>
                <td className="px-4 py-3">{e.isAdmin ? 'Admin' : 'Nhân viên'}</td>
                <td className="px-4 py-3">{e.isActive ? '✓' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
