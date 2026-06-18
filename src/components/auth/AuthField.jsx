// src/components/auth/AuthField.jsx
// Figma-styled input: full width, 1px border ink-100, focus → primary,
// error → red border + red helper text.
import { forwardRef } from 'react';

const AuthField = forwardRef(function AuthField(
  { label, error, hint, className = '', ...props },
  ref
) {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="mb-1.5 block text-sm font-medium text-ink-700">{label}</label>}
      <input
        ref={ref}
        className={[
          'w-full rounded-xl border px-4 py-3 text-sm text-ink-900 outline-none transition',
          'placeholder:text-ink-300 focus:ring-2 focus:ring-primary-500/30',
          error ? 'border-red-500 focus:border-red-500' : 'border-ink-100 focus:border-primary-600',
        ].join(' ')}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-300">{hint}</p>
      ) : null}
    </div>
  );
});

export default AuthField;
