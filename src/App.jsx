import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import CarListPage from './pages/car/CarListPage.jsx';
import CarDetailPage from './pages/car/CarDetailPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import CheckoutPage from './pages/booking/CheckoutPage.jsx';
import BookingSuccessPage from './pages/booking/BookingSuccessPage.jsx';
import PaymentPage from './pages/booking/PaymentPage.jsx';
import PaymentResultPage from './pages/booking/PaymentResultPage.jsx';
import ProfilePage from './pages/user/ProfilePage.jsx';
import MyBookingsPage from './pages/user/MyBookingsPage.jsx';
import BookingDetailPage from './pages/user/BookingDetailPage.jsx';
import UserLayout from './components/layout/UserLayout.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/cars" element={<CarListPage />} />
        <Route path="/cars/:id" element={<CarDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected */}
        <Route
          path="/checkout/:carId"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-success/:bookingId"
          element={
            <ProtectedRoute>
              <BookingSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:bookingId"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        {/* VNPay redirects the browser here after payment (status in query). */}
        <Route
          path="/payment/result"
          element={
            <ProtectedRoute>
              <PaymentResultPage />
            </ProtectedRoute>
          }
        />
        {/* User account area — left sidebar layout (Figma: UserAccount-*) */}
        <Route
          path="/me"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProfilePage />} />
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="bookings/:id" element={<BookingDetailPage />} />
          <Route path="wallet" element={<AccountPlaceholder title="Ví tiền" />} />
          <Route path="addresses" element={<AccountPlaceholder title="Địa chỉ của tôi" />} />
          <Route path="payments" element={<AccountPlaceholder title="Lịch sử thanh toán" />} />
          <Route path="reviews" element={<AccountPlaceholder title="Đánh giá" />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

// Lightweight placeholder for sidebar pages not yet implemented (Day 14 scope).
function AccountPlaceholder({ title }) {
  return (
    <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-sm text-gray-500">Tính năng này sẽ sớm được hoàn thiện.</p>
    </div>
  );
}
