// src/components/auth/AuthButton.jsx
// Figma "continue" button: full-width, rounded, primary background.
// Disabled state = bg-ink-100 text-ink-300.
export default function AuthButton({
  children,
  loading = false,
  disabled = false,
  type = 'button',
  variant = 'primary',
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading;

  const base =
    'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed';

  const variants = {
    primary: isDisabled
      ? 'bg-ink-100 text-ink-300'
      : 'bg-primary-600 text-white hover:bg-primary-700',
    ghost: 'bg-transparent text-primary-600 hover:bg-primary-50',
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  );
}
