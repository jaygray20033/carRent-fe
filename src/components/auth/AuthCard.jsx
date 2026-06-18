// src/components/auth/AuthCard.jsx — page-level auth card (same look as modal)
import AuthLogo from './AuthLogo.jsx';

export default function AuthCard({ title, desc, children, footer }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm sm:p-8">
        <AuthLogo />
        <div className="mt-5 text-center">
          <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
          {desc && <p className="mt-1 text-sm text-ink-300">{desc}</p>}
        </div>
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-4 text-center text-sm text-ink-400">{footer}</div>}
    </div>
  );
}
