import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Phone badge */}
          <div className="hidden md:flex items-center gap-2 bg-[#1a2332] text-white text-sm px-4 py-2 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>09122215455</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Search icon */}
          <button className="hidden md:flex p-2 hover:bg-gray-100 rounded-full transition">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {['Trang chủ', 'Thuê xe tự lái', 'Thuê xe có tài xế', 'Tạp chí', 'Liên hệ'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-medium text-gray-700 hover:text-[#f5a623] transition-colors whitespace-nowrap"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">
              <span className="text-[#f5a623]">Oto</span>
              <span className="text-[#1a2332]">Rent</span>
            </span>
            <div className="w-8 h-8 bg-[#1a2332] rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-[#f5a623]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
          </a>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t">
            {['Trang chủ', 'Thuê xe tự lái', 'Thuê xe có tài xế', 'Tạp chí', 'Liên hệ'].map((item) => (
              <a key={item} href="#" className="block py-2 text-sm font-medium text-gray-700 hover:text-[#f5a623]">
                {item}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
