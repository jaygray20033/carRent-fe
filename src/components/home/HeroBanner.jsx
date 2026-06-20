/**
 * Section 1 — Hero (ảnh Ford Explorer)
 * Full-width background image, title+subtitle bên trái, CTA banner đen
 */
export default function HeroBanner() {
  return (
    <section className="relative min-h-[420px] md:min-h-[520px] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1600&h=800&fit=crop"
          alt="Ford Explorer - OtoRent hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/80 via-ink-900/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container-app py-16 md:py-24">
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            OtoRent Nhanh chóng,
            <br />
            <span className="text-brand-accent">Dễ dàng</span> và{' '}
            <span className="text-brand-accent">Tiết Kiệm</span>
          </h1>
          <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 max-w-md">
            Đặt xe trải nghiệm lái xe đầy phong cách và sang trọng. Chúng tôi cung cấp dịch vụ thuê
            xe cao cấp trên toàn Việt Nam.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#booking-search" className="btn btn-accent btn-lg shadow-lg">
              Đặt xe ngay
            </a>
            <a
              href="#why-choose"
              className="btn btn-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm"
            >
              Tìm hiểu thêm
            </a>
          </div>
        </div>
      </div>

      {/* Black CTA banner at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-ink-900/90 backdrop-blur-sm py-3">
        <div className="container-app flex items-center justify-between text-white text-xs md:text-sm">
          <span className="text-white/60">
            Hơn <strong className="text-brand-accent">500+ xe</strong> sẵn sàng cho bạn
          </span>
          <span className="hidden md:inline text-white/60">
            Giao xe tận nơi &bull; Bảo hiểm 24/7 &bull; Hỗ trợ cứu hộ
          </span>
        </div>
      </div>
    </section>
  );
}
