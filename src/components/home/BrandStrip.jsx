import { useEffect, useState } from 'react';
import { brandService } from '../../services/brandService.js';

/**
 * Section 3 — Brand carousel grayscale
 * Logo BMW, Lexus, Mercedes... ở grayscale, hover thì màu lên
 */
export default function BrandStrip() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    brandService
      .list()
      .then((res) => {
        setBrands(res.data?.brands || []);
      })
      .catch(() => {});
  }, []);

  if (!brands.length) return null;

  return (
    <section className="py-8 bg-white border-y border-ink-100">
      <div className="container-app">
        <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="group flex items-center justify-center h-12 w-20 md:w-24 transition-all duration-300"
              title={brand.name}
            >
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="max-h-10 max-w-full object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  loading="lazy"
                />
              ) : (
                <span className="text-sm font-bold text-ink-300 group-hover:text-ink-700 transition-colors">
                  {brand.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
