// src/components/auth/OtpInput.jsx
// 6-box OTP input with: auto-focus next, backspace to previous,
// arrow-key navigation, and full-code paste support.
import { useRef, useEffect } from 'react';

export default function OtpInput({ length = 6, value = '', onChange, error = false, autoFocus = true }) {
  const inputsRef = useRef([]);

  // Normalise the controlled value to a fixed-length char array
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  const emit = (next) => {
    onChange?.(next.join('').slice(0, length));
  };

  const focusAt = (idx) => {
    const el = inputsRef.current[idx];
    if (el) {
      el.focus();
      el.select?.();
    }
  };

  const handleChange = (idx, raw) => {
    const char = raw.replace(/\D/g, '').slice(-1); // keep last numeric char
    const next = [...digits];
    next[idx] = char;
    emit(next);
    if (char && idx < length - 1) focusAt(idx + 1);
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (next[idx]) {
        next[idx] = '';
        emit(next);
      } else if (idx > 0) {
        next[idx - 1] = '';
        emit(next);
        focusAt(idx - 1);
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      focusAt(idx - 1);
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      focusAt(idx + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = Array.from({ length }, (_, i) => pasted[i] ?? '');
    emit(next);
    const focusIdx = Math.min(pasted.length, length - 1);
    focusAt(focusIdx);
  };

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {digits.map((d, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onFocus={(e) => e.target.select()}
          aria-label={`OTP digit ${idx + 1}`}
          className={[
            'h-12 w-12 rounded-xl border text-center text-lg font-semibold outline-none transition',
            'focus:ring-2 focus:ring-primary-500/40',
            error
              ? 'border-red-500 text-red-600 focus:border-red-500'
              : 'border-ink-100 text-ink-900 focus:border-primary-600',
          ].join(' ')}
        />
      ))}
    </div>
  );
}
