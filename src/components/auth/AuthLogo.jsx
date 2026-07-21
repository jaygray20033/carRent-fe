// src/components/auth/AuthLogo.jsx — OtoRent logo centered on top of modal
import { Car } from 'lucide-react';

export default function AuthLogo() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        <span className="rounded-xl bg-primary-600 p-2 text-white">
          <Car className="h-6 w-6" />
        </span>
        <span className="text-2xl font-extrabold tracking-tight text-ink-900">
          Oto<span className="text-primary-600">Rent</span>
        </span>
      </div>
    </div>
  );
}
