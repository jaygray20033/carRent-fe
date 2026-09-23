// src/components/partner/RegisterGateCard.jsx
// Gate-early card shown to guests on partner/enterprise registration pages.
// Instead of letting a guest fill a long form and hitting them with a login
// modal on submit, we require sign-in up front: the form only renders once
// authenticated. This card explains what the flow needs and opens the auth
// modal; after login the page re-renders and reveals the real form.
import { Lock, ClipboardList, LogIn, UserPlus } from 'lucide-react';
import useUiStore from '../../store/uiStore.js';
import Button from '../ui/Button.jsx';

export default function RegisterGateCard({ title, description, checklist = [] }) {
  const openAuthModal = useUiStore((s) => s.openAuthModal);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 md:p-8">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
        <Lock className="h-6 w-6" />
      </span>

      <h2 className="text-lg font-bold text-ink-900">{title}</h2>
      <p className="mt-2 text-sm text-ink-500">{description}</p>

      {checklist.length > 0 && (
        <div className="mt-5 rounded-xl bg-ink-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-700">
            <ClipboardList className="h-4 w-4 text-ink-400" />
            Cần chuẩn bị
          </div>
          <ul className="space-y-1.5 text-sm text-ink-600">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          leftIcon={<LogIn className="h-4 w-4" />}
          onClick={() => openAuthModal('login')}
        >
          Đăng nhập
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          leftIcon={<UserPlus className="h-4 w-4" />}
          onClick={() => openAuthModal('register')}
        >
          Tạo tài khoản
        </Button>
      </div>

      <p className="mt-4 text-xs text-ink-400">
        Đăng nhập xong bạn sẽ được đưa thẳng tới biểu mẫu đăng ký ngay trên trang này.
      </p>
    </div>
  );
}
