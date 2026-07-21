// src/pages/enterprise/VasCatalogPage.jsx
import { useQuery } from '@tanstack/react-query';
import { enterpriseService } from '../../services/enterpriseService.js';
import Loading from '../../components/common/Loading.jsx';

export default function EnterpriseVasCatalogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['enterprise', 'vasPricing'],
    queryFn: () => enterpriseService.myVasPricing(),
  });
  const items = (data?.data ?? data)?.items || [];
  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink-700">Dịch vụ gia tăng</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((v) => (
          <div
            key={v.vasId || v.id}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100"
          >
            <div className="font-semibold text-ink-700">{v.name}</div>
            <div className="mt-1 text-sm text-ink-500">{v.description || v.unit}</div>
            <div className="mt-3 text-lg font-bold text-brand-primary">
              {Number(v.unitPrice).toLocaleString('vi-VN')}đ
              <span className="ml-1 text-xs font-normal text-ink-400">/ {v.unit}</span>
            </div>
            {v.isNegotiated && (
              <div className="mt-1 text-xs text-emerald-600">Giá đàm phán HĐ</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
