import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Clock, TrendingUp, X, ArrowRight } from 'lucide-react';
import { carService } from '../services/carService.js';
import useDebounce from '../hooks/useDebounce.js';
import { formatCurrency } from '../utils/format.js';

const RECENT_KEY = 'otorent:recent-searches';
const POPULAR = ['Mercedes', 'BMW', 'Toyota Camry', 'Xe 7 chỗ', 'Hyundai Santa Fe', 'Ford'];

function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveRecent(list) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));
}

export default function SearchPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [term, setTerm] = useState('');
  const [recent, setRecent] = useState(loadRecent);
  const debounced = useDebounce(term, 300);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Live auto-complete suggestions
  const { data: suggestResp, isFetching } = useQuery({
    queryKey: ['car-search', debounced],
    queryFn: () => carService.search(debounced, 6),
    enabled: debounced.trim().length >= 1,
  });
  const suggestions = suggestResp?.data ?? { models: [], brands: [], vehicles: [] };
  const hasSuggestions =
    (suggestions.brands?.length || 0) +
      (suggestions.models?.length || 0) +
      (suggestions.vehicles?.length || 0) >
    0;

  const goSearch = (q) => {
    const query = (q ?? term).trim();
    if (!query) return;
    const next = [query, ...recent.filter((r) => r.toLowerCase() !== query.toLowerCase())];
    setRecent(next);
    saveRecent(next);
    navigate(`/cars?q=${encodeURIComponent(query)}`);
  };

  const removeRecent = (q) => {
    const next = recent.filter((r) => r !== q);
    setRecent(next);
    saveRecent(next);
  };
  const clearRecent = () => {
    setRecent([]);
    saveRecent([]);
  };

  return (
    <div className="min-h-[70vh] bg-ink-50">
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ink-900 md:text-3xl">Bạn muốn thuê xe gì?</h1>
          <p className="mt-2 text-sm text-ink-500">
            Tìm kiếm theo tên xe, thương hiệu hoặc dòng xe yêu thích.
          </p>
        </div>

        {/* Big search input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goSearch();
          }}
          className="relative mt-8"
        >
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
          <input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Tìm kiếm xe, thương hiệu, model..."
            className="w-full rounded-2xl border border-ink-100 bg-white py-4 pl-14 pr-28 text-base text-ink-900 shadow-card placeholder:text-ink-300 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary-light"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-dark"
          >
            Tìm
          </button>
        </form>

        {/* Live suggestions dropdown (when typing) */}
        {debounced.trim().length >= 1 && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
            {isFetching && !hasSuggestions ? (
              <p className="px-5 py-4 text-sm text-ink-400">Đang tìm…</p>
            ) : !hasSuggestions ? (
              <p className="px-5 py-4 text-sm text-ink-400">
                Không có gợi ý cho “{debounced}”. Nhấn <b>Tìm</b> để xem tất cả kết quả.
              </p>
            ) : (
              <ul className="divide-y divide-ink-50">
                {suggestions.brands?.map((b) => (
                  <li key={`b-${b.id}`}>
                    <button
                      onClick={() => goSearch(b.name)}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-ink-50"
                    >
                      <Search className="h-4 w-4 text-ink-300" />
                      <span className="text-sm text-ink-700">{b.name}</span>
                      <span className="ml-auto text-xs text-ink-300">Thương hiệu</span>
                    </button>
                  </li>
                ))}
                {suggestions.vehicles?.map((v) => (
                  <li key={`v-${v.id}`}>
                    <button
                      onClick={() => navigate(`/cars/${v.id}`)}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-ink-50"
                    >
                      <img
                        src={v.thumbnailUrl || 'https://placehold.co/64x40?text=Car'}
                        alt={v.name}
                        className="h-10 w-16 rounded object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-900">{v.name}</p>
                        <p className="text-xs text-ink-400">
                          {formatCurrency(v.pricePerDay)} / ngày
                        </p>
                      </div>
                      <ArrowRight className="ml-auto h-4 w-4 text-ink-300" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Default state: popular + recent */}
        {debounced.trim().length < 1 && (
          <div className="mt-8 space-y-8">
            {/* Popular */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-primary" />
                <h2 className="text-sm font-semibold text-ink-900">Xe phổ biến</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((p) => (
                  <button
                    key={p}
                    onClick={() => goSearch(p)}
                    className="rounded-full border border-ink-100 bg-white px-4 py-2 text-sm text-ink-700 transition hover:border-brand-primary hover:text-brand-primary"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent */}
            {recent.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-ink-400" />
                    <h2 className="text-sm font-semibold text-ink-900">Tìm kiếm gần đây</h2>
                  </div>
                  <button
                    onClick={clearRecent}
                    className="text-xs text-ink-400 transition hover:text-danger"
                  >
                    Xoá tất cả
                  </button>
                </div>
                <ul className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
                  {recent.map((r) => (
                    <li
                      key={r}
                      className="flex items-center gap-3 border-b border-ink-50 px-5 py-3 last:border-b-0"
                    >
                      <Clock className="h-4 w-4 text-ink-300" />
                      <button
                        onClick={() => goSearch(r)}
                        className="flex-1 text-left text-sm text-ink-700 hover:text-brand-primary"
                      >
                        {r}
                      </button>
                      <button
                        onClick={() => removeRecent(r)}
                        className="rounded p-1 text-ink-300 hover:bg-ink-50 hover:text-ink-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
