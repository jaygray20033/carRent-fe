import { Link } from 'react-router-dom';

// Day 44 — 404 page (Figma: 404-ErrorPage.png).
// "404" where the middle 0 is a car tyre, sitting in front of a faint grayscale
// city skyline, with the caption and an outlined "Về trang chủ" button.
export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center">
      <div className="relative w-full">
        {/* Faint city skyline behind the 404 */}
        <svg
          viewBox="0 0 600 220"
          className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl text-ink-100"
          aria-hidden="true"
          fill="currentColor"
        >
          <rect x="20" y="120" width="40" height="100" />
          <rect x="70" y="90" width="30" height="130" />
          <rect x="110" y="140" width="45" height="80" />
          <rect x="165" y="70" width="34" height="150" />
          <rect x="210" y="110" width="40" height="110" />
          <rect x="360" y="100" width="38" height="120" />
          <rect x="405" y="60" width="30" height="160" />
          <rect x="445" y="130" width="46" height="90" />
          <rect x="500" y="95" width="32" height="125" />
          <rect x="540" y="125" width="40" height="95" />
        </svg>

        {/* 4 — tyre — 4 */}
        <div className="relative flex items-center justify-center gap-2 md:gap-4">
          <span className="text-[7rem] font-extrabold leading-none text-primary-600 md:text-[10rem]">
            4
          </span>
          <Tyre />
          <span className="text-[7rem] font-extrabold leading-none text-primary-600 md:text-[10rem]">
            4
          </span>
        </div>
      </div>

      <p className="relative mt-6 text-lg font-medium text-ink-700">
        Không tìm thấy trang yêu cầu
      </p>

      <Link
        to="/"
        className="relative mt-6 rounded-lg border border-primary-600 px-6 py-2.5 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-600 hover:text-white"
      >
        Quay lại trang chủ
      </Link>
    </div>
  );
}

// Simple top-down car tyre used as the "0" in 404.
function Tyre() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-28 w-28 md:h-40 md:w-40"
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="96" fill="#1f2937" />
      <circle cx="100" cy="100" r="60" fill="#111827" />
      <circle cx="100" cy="100" r="42" fill="#e5e7eb" />
      <circle cx="100" cy="100" r="14" fill="#9ca3af" />
      {/* 5 lug bolts */}
      {[0, 72, 144, 216, 288].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 100 + 26 * Math.cos(rad);
        const cy = 100 + 26 * Math.sin(rad);
        return <circle key={deg} cx={cx} cy={cy} r="5" fill="#6b7280" />;
      })}
    </svg>
  );
}
