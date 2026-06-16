import { Loader2 } from 'lucide-react';

export default function Loading({ label = 'Đang tải...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
