import { Car } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary-600 p-2 text-white">
            <Car className="h-4 w-4" />
          </div>
          <span className="font-semibold text-gray-900">CarRent</span>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          © {new Date().getFullYear()} CarRent — Nền tảng thuê xe ô tô trực tuyến.
        </p>
      </div>
    </footer>
  );
}
