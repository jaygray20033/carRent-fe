import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { carService } from '../../services/carService.js';
import CarCard from '../car/CarCard.jsx';

/**
 * Section 6 — "Đặt xe tại OtoRent" (3 tabs × 6 cards)
 * Tabs: Xe đời mới / Xe sang / Đắt hàng
 * Grid 3 cols × 2 rows
 */
const TABS = [
  { key: 'XE_DOI_MOI', label: 'Xe đời mới' },
  { key: 'XE_SANG', label: 'Xe sang' },
  { key: 'DAT_HANG', label: 'Đắt hàng' },
];

export default function FeaturedCars() {
  const [activeTab, setActiveTab] = useState('XE_DOI_MOI');
  const [cars, setCars] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Preload all tabs
    const loadAll = async () => {
      setLoading(true);
      const results = {};
      for (const tab of TABS) {
        try {
          const res = await carService.list({ tag: tab.key, size: 6 });
          results[tab.key] = res.data?.items || [];
        } catch {
          results[tab.key] = [];
        }
      }
      setCars(results);
      setLoading(false);
    };
    loadAll();
  }, []);

  const currentCars = cars[activeTab] || [];

  return (
    <section className="py-12 md:py-16 bg-ink-50">
      <div className="container-app">
        {/* Section header */}
        <div className="text-center mb-8">
          <p className="text-brand-primary font-semibold text-sm mb-1">
            Khám phá những lựa chọn tốt nhất
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-ink-900">
            Đặt xe tại <span className="text-brand-primary">OtoRent</span>
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-xl p-1 shadow-sm border border-ink-100">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Car grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CarCard key={i} loading car={{}} />)
            : currentCars.map((car) => <CarCard key={car.id} car={car} />)}
        </div>

        {/* View all link */}
        <div className="text-center mt-8">
          <Link to="/cars" className="btn btn-outline btn-md">
            Xem tất cả xe &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
