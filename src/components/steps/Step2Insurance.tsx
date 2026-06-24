import type { InsurancePackage } from '../../utils/types'
import { formatVND } from '../../utils/format'

interface Step2Props {
  packages: InsurancePackage[]
  selectedId: string
  onSelect: (id: string) => void
  onBack: () => void
  onNext: () => void
}

export default function Step2Insurance({ packages, selectedId, onSelect, onBack, onNext }: Step2Props) {
  return (
    <div className="animate-slide-in">
      {/* Section title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#1a2332] rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1a2332]">Chọn gói bảo hiểm</h2>
          <p className="text-sm text-gray-500">Bảo vệ chuyến đi của bạn với gói bảo hiểm phù hợp</p>
        </div>
      </div>

      {/* Insurance cards */}
      <div className="grid grid-cols-1 gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`radio-card ${selectedId === pkg.id ? 'selected' : ''} relative`}
            onClick={() => onSelect(pkg.id)}
          >
            {pkg.recommended && (
              <div className="absolute -top-3 left-6 bg-[#f5a623] text-[#1a2332] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                ⭐ Khuyên dùng
              </div>
            )}

            <div className="flex items-start gap-4">
              {/* Radio dot */}
              <div className="radio-dot mt-0.5">
                <div className="radio-dot-inner" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-[#1a2332]">{pkg.name}</h3>
                  <span className={`text-sm font-bold ${pkg.price > 0 ? 'text-[#f5a623]' : 'text-gray-400'}`}>
                    {pkg.price > 0 ? `${formatVND(pkg.price)} VND/ngày` : 'Miễn phí'}
                  </span>
                </div>

                {/* Benefits */}
                <ul className="space-y-2">
                  {pkg.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      {pkg.id === 'none' ? (
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex justify-between mt-6">
        <button className="btn-secondary" onClick={onBack}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Quay lại
        </button>
        <button className="btn-primary" onClick={onNext}>
          Tiếp tục
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  )
}
