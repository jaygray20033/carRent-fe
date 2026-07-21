// src/components/enterprise/SLABanner.jsx
export default function SLABanner({ contractTerminationRisk = false, warningMessage = null }) {
  if (!contractTerminationRisk && !warningMessage) return null;

  if (contractTerminationRisk) {
    return (
      <div
        data-testid="sla-banner-critical"
        className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
      >
        <strong className="font-semibold">Cảnh báo chấm dứt HĐ:</strong>{' '}
        {warningMessage ||
          'Công ty đã có ≥ 2 vi phạm CRITICAL — đủ điều kiện chấm dứt hợp đồng theo Điều 3.'}
      </div>
    );
  }

  return (
    <div
      data-testid="sla-banner-warning"
      className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <strong className="font-semibold">Cảnh báo:</strong> {warningMessage}
    </div>
  );
}
