import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Không có dữ liệu', description, action }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <div className="rounded-full bg-gray-100 p-3 text-gray-400">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-gray-700">{title}</h3>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      {action}
    </div>
  );
}
