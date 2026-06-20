import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService.js';

/**
 * Section 5 — Category selector
 * Thể thao, SUV, Mui Trần, Sedan, Coupe — chips với icon xe
 */
const CATEGORY_ICONS = {
  sedan: '🚗',
  suv: '🚙',
  'the-thao': '🏎️',
  'mui-tran': '🏎️',
  coupe: '🚘',
  mpv: '🚐',
  hatchback: '🚗',
};

export default function CategoryTabs() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    categoryService
      .list()
      .then((res) => {
        setCategories(res.data?.categories || []);
      })
      .catch(() => {});
  }, []);

  if (!categories.length) return null;

  return (
    <section className="py-10 bg-white">
      <div className="container-app">
        <div className="text-center mb-6">
          <p className="text-brand-primary font-semibold text-sm mb-1">Danh mục xe</p>
          <h2 className="text-xl md:text-2xl font-bold text-ink-900">Chọn phong cách của bạn</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/cars?category=${cat.slug}`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-ink-100 bg-white text-sm font-medium text-ink-700 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="text-base">{CATEGORY_ICONS[cat.slug] || '🚗'}</span>
              <span>{cat.name}</span>
              {cat._count?.vehicles > 0 && (
                <span className="text-xs text-ink-400 group-hover:text-white/70">
                  ({cat._count.vehicles})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
