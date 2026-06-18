import { Link, NavLink } from 'react-router-dom';
import { Car, User, LogIn, LogOut, ListChecks } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useUiStore } from '../../store/uiStore.js';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const openAuthModal = useUiStore((s) => s.openAuthModal);

  const navClass = ({ isActive }) =>
    `text-sm font-medium px-3 py-2 rounded-md transition ${
      isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-primary-600 p-2 text-white">
            <Car className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-gray-900">
            Oto<span className="text-primary-600">Rent</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" end className={navClass}>
            Trang chủ
          </NavLink>
          <NavLink to="/cars" className={navClass}>
            Danh sách xe
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/me/bookings" className={navClass}>
              Đơn của tôi
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/me" className="btn-outline">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.fullName?.split(' ').pop()}</span>
              </Link>
              <button onClick={logout} className="btn-outline">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </>
          ) : (
            <>
              {/* Mở modal overlay theo Figma — KHÔNG redirect */}
              <button onClick={() => openAuthModal('login')} className="btn-outline">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
              <button onClick={() => openAuthModal('register')} className="btn-primary">
                <ListChecks className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng ký</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
