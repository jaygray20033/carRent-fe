import { useEffect, useRef, lazy, Suspense } from 'react';

// Section 1: Hero (above fold — load immediately)
import HeroBanner from '../components/home/HeroBanner.jsx';

// Section 2: Booking Search Bar (above fold — load immediately)
import BookingSearchBar from '../components/booking/BookingSearchBar.jsx';

// Section 3: Brand Strip (above fold — load immediately)
import BrandStrip from '../components/home/BrandStrip.jsx';

// Lazy-loaded sections below the fold
const WhyChooseUs = lazy(() => import('../components/home/WhyChooseUs.jsx'));
const CategoryTabs = lazy(() => import('../components/home/CategoryTabs.jsx'));
const FeaturedCars = lazy(() => import('../components/home/FeaturedCars.jsx'));
const HowItWorks = lazy(() => import('../components/home/HowItWorks.jsx'));
const FaqSection = lazy(() => import('../components/home/FaqSection.jsx'));
const TestimonialSlider = lazy(() => import('../components/home/TestimonialSlider.jsx'));
const MagazineGrid = lazy(() => import('../components/home/MagazineGrid.jsx'));

/**
 * HomePage — 10 sections chi tiết theo Figma Home.png
 *
 * 1. HeroBanner (ảnh Ford Explorer)
 * 2. BookingSearchBar (sticky overlap hero)
 * 3. BrandStrip (grayscale brand logos)
 * 4. WhyChooseUs (4 cột, nền đen)
 * 5. CategoryTabs (chips với icon xe)
 * 6. FeaturedCars (3 tabs × 6 cards)
 * 7. HowItWorks (4 bước)
 * 8. FaqSection (yellow block, accordion)
 * 9. TestimonialSlider (reviews)
 * 10. MagazineGrid (3 bài blog)
 */
export default function HomePage() {
  // SEO: dynamic title
  useEffect(() => {
    document.title = 'OtoRent — Thuê xe ô tô tự lái & có tài xế';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'OtoRent - Nền tảng thuê xe ô tô tự lái và có tài xế hàng đầu Việt Nam. Hàng trăm xe đời mới, giá tốt, bảo hiểm 24/7.'
      );
    }
  }, []);

  const SectionFallback = () => (
    <div className="py-16 flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* S1: Hero */}
      <HeroBanner />

      {/* S2: Booking Search Bar — overlap hero */}
      <div id="booking-search" className="relative z-20 container-app -mt-8 md:-mt-12 mb-6">
        <BookingSearchBar variant="hero" />
      </div>

      {/* S3: Brand carousel */}
      <BrandStrip />

      {/* S4: Tại sao chọn OtoRent (lazy) */}
      <Suspense fallback={<SectionFallback />}>
        <WhyChooseUs />
      </Suspense>

      {/* S5: Category chips (lazy) */}
      <Suspense fallback={<SectionFallback />}>
        <CategoryTabs />
      </Suspense>

      {/* S6: Featured Cars (lazy) */}
      <Suspense fallback={<SectionFallback />}>
        <FeaturedCars />
      </Suspense>

      {/* S7: How it works (lazy) */}
      <Suspense fallback={<SectionFallback />}>
        <HowItWorks />
      </Suspense>

      {/* S8: FAQs (lazy) */}
      <Suspense fallback={<SectionFallback />}>
        <FaqSection />
      </Suspense>

      {/* S9: Testimonials (lazy) */}
      <Suspense fallback={<SectionFallback />}>
        <TestimonialSlider />
      </Suspense>

      {/* S10: Magazine (lazy) */}
      <Suspense fallback={<SectionFallback />}>
        <MagazineGrid />
      </Suspense>
    </div>
  );
}
