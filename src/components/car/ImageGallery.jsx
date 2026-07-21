// src/components/car/ImageGallery.jsx — PDP image gallery with main + thumbnails
import { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';

const PLACEHOLDER = 'https://placehold.co/900x520?text=Car';

export default function ImageGallery({ images = [], carName = '' }) {
  const allImages = images.length > 0 ? images : [{ url: PLACEHOLDER }];
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbRef = useRef(null);

  const goTo = useCallback(
    (idx) => {
      const next = (idx + allImages.length) % allImages.length;
      setActiveIdx(next);
      // scroll thumbnail into view
      thumbRef.current?.children[next]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    },
    [allImages.length],
  );

  return (
    <>
      {/* Main Image */}
      <div className="relative group overflow-hidden rounded-2xl bg-ink-100">
        <img
          src={allImages[activeIdx]?.url || PLACEHOLDER}
          alt={`${carName} - ${activeIdx + 1}`}
          className="w-full aspect-[16/9] object-cover transition-transform duration-300"
        />

        {/* Nav arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={() => goTo(activeIdx - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5 text-ink-700" />
            </button>
            <button
              onClick={() => goTo(activeIdx + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight className="w-5 h-5 text-ink-700" />
            </button>
          </>
        )}

        {/* Fullscreen button */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <Expand className="w-4 h-4 text-ink-700" />
        </button>

        {/* Counter */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
          {activeIdx + 1} / {allImages.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {allImages.length > 1 && (
        <div
          ref={thumbRef}
          className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
        >
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeIdx
                  ? 'border-brand-primary shadow-md'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img.url || PLACEHOLDER}
                alt={`Thumb ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl font-light z-10"
          >
            &times;
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goTo(activeIdx - 1);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <img
            src={allImages[activeIdx]?.url || PLACEHOLDER}
            alt={carName}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              goTo(activeIdx + 1);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx(i);
                }}
                className={`w-2 h-2 rounded-full transition ${
                  i === activeIdx ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
