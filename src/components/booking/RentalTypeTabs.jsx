// src/components/booking/RentalTypeTabs.jsx
import { Car, UserCheck, Plane } from 'lucide-react';

const TABS = [
  { key: 'SELF_DRIVE', label: 'Tự lái', icon: Car },
  { key: 'WITH_DRIVER', label: 'Có tài xế', icon: UserCheck },
  { key: 'AIRPORT', label: 'Ra sân bay', icon: Plane },
];

export default function RentalTypeTabs({ value = 'SELF_DRIVE', onChange }) {
  return (
    <div className="flex rounded-xl bg-ink-50 p-1 gap-1">
      {TABS.map(({ key, label, icon: Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange?.(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              active
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-ink-500 hover:text-ink-700 hover:bg-white/60'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
