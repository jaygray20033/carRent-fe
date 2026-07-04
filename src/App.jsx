import { Routes, Route, Navigate } from 'react-router-dom';
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
import BlogListPage from './pages/blog/BlogListPage.jsx';
import BlogDetailPage from './pages/blog/BlogDetailPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import CheckoutPage from './pages/booking/CheckoutPage.jsx';
import BookingSuccessPage from './pages/booking/BookingSuccessPage.jsx';
import PaymentPage from './pages/booking/PaymentPage.jsx';
import PaymentResultPage from './pages/booking/PaymentResultPage.jsx';
import ProfilePage from './pages/user/ProfilePage.jsx';
import ChangePasswordPage from './pages/user/ChangePasswordPage.jsx';
import ChangePhonePage from './pages/user/ChangePhonePage.jsx';
import MyBookingsPage from './pages/user/MyBookingsPage.jsx';
import BookingDetailPage from './pages/user/BookingDetailPage.jsx';
import AddressBookPage from './pages/user/AddressBookPage.jsx';
import WalletPage from './pages/user/WalletPage.jsx';
import PaymentHistoryPage from './pages/user/PaymentHistoryPage.jsx';
import ReviewsPage from './pages/user/ReviewsPage.jsx';
import NotificationsPage from './pages/user/NotificationsPage.jsx';
import UserLayout from './components/layout/UserLayout.jsx';

import AdminLayout from './components/layout/AdminLayout.jsx';
import AdminRoute from './components/auth/AdminRoute.jsx';
import PostListPage from './pages/admin/PostListPage.jsx';
import PostFormPage from './pages/admin/PostFormPage.jsx';
import CommentModerationPage from './pages/admin/CommentModerationPage.jsx';
import CouponListPage from './pages/admin/CouponListPage.jsx';
import CouponFormPage from './pages/admin/CouponFormPage.jsx';
import CategoryListPage from './pages/admin/CategoryListPage.jsx';
import TagListPage from './pages/admin/TagListPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/cars" element={<CarListPage />} />
        <Route path="/cars/:id" element={<CarDetailPage />} />
        <Route path="/magazine" element={<BlogListPage />} />
        <Route path="/magazine/:slug" element={<BlogDetailPage />} />
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
          <Route path="change-password" element={<ChangePasswordPage />} />
          <Route path="change-phone" element={<ChangePhonePage />} />
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="bookings/:id" element={<BookingDetailPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="addresses" element={<AddressBookPage />} />
          <Route path="payments" element={<PaymentHistoryPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin area — own layout, ADMIN/OPERATOR only (no MainLayout chrome) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/posts" replace />} />
        <Route path="posts" element={<PostListPage />} />
        <Route path="posts/new" element={<PostFormPage />} />
        <Route path="posts/:id" element={<PostFormPage />} />
        <Route path="post-categories" element={<CategoryListPage />} />
        <Route path="tags" element={<TagListPage />} />
        <Route path="comments" element={<CommentModerationPage />} />
        <Route path="coupons" element={<CouponListPage />} />
        <Route path="coupons/new" element={<CouponFormPage />} />
        <Route path="coupons/:id" element={<CouponFormPage />} />
      </Route>
    </Routes>
  );
}
