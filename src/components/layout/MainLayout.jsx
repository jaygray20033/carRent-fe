import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import AuthModalHost from '../auth/AuthModalHost.jsx';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Global auth modal overlay */}
      <AuthModalHost />
    </div>
  );
}
