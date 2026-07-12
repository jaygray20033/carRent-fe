import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout.jsx';
import UserLayout from './components/layout/UserLayout.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import AdminRoute from './components/auth/AdminRoute.jsx';
import ErrorBoundary from './pages/ErrorBoundary.jsx';
import Loading from './components/common/Loading.jsx';

// Day 44 — code-split every page behind React.lazy so the initial bundle only
// carries the shell (layouts + router). Each route chunk is fetched on demand.
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage.jsx'));
const CarListPage = lazy(() => import('./pages/car/CarListPage.jsx'));
const CarDetailPage = lazy(() => import('./pages/car/CarDetailPage.jsx'));
const BlogListPage = lazy(() => import('./pages/blog/BlogListPage.jsx'));
const BlogDetailPage = lazy(() => import('./pages/blog/BlogDetailPage.jsx'));
const SearchPage = lazy(() => import('./pages/SearchPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage.jsx'));
const FaqPage = lazy(() => import('./pages/FaqPage.jsx'));
const DeliveryPage = lazy(() => import('./pages/DeliveryPage.jsx'));
const RulesPage = lazy(() => import('./pages/RulesPage.jsx'));
const LegalPage = lazy(() => import('./pages/LegalPage.jsx'));
const RoadsidePage = lazy(() => import('./pages/RoadsidePage.jsx'));
const AgentRegisterPage = lazy(() => import('./pages/AgentRegisterPage.jsx'));
const CheckoutPage = lazy(() => import('./pages/booking/CheckoutPage.jsx'));
const BookingSuccessPage = lazy(() => import('./pages/booking/BookingSuccessPage.jsx'));
const PaymentPage = lazy(() => import('./pages/booking/PaymentPage.jsx'));
const PaymentResultPage = lazy(() => import('./pages/booking/PaymentResultPage.jsx'));
const SOSPage = lazy(() => import('./pages/SOSPage.jsx'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage.jsx'));
const ChangePasswordPage = lazy(() => import('./pages/user/ChangePasswordPage.jsx'));
const ChangePhonePage = lazy(() => import('./pages/user/ChangePhonePage.jsx'));
const MyBookingsPage = lazy(() => import('./pages/user/MyBookingsPage.jsx'));
const BookingDetailPage = lazy(() => import('./pages/user/BookingDetailPage.jsx'));
const AddressBookPage = lazy(() => import('./pages/user/AddressBookPage.jsx'));
const WalletPage = lazy(() => import('./pages/user/WalletPage.jsx'));
const PaymentHistoryPage = lazy(() => import('./pages/user/PaymentHistoryPage.jsx'));
const ReviewsPage = lazy(() => import('./pages/user/ReviewsPage.jsx'));
const NotificationsPage = lazy(() => import('./pages/user/NotificationsPage.jsx'));

const DashboardPage = lazy(() => import('./pages/admin/DashboardPage.jsx'));
const PostListPage = lazy(() => import('./pages/admin/PostListPage.jsx'));
const PostFormPage = lazy(() => import('./pages/admin/PostFormPage.jsx'));
const CommentModerationPage = lazy(() => import('./pages/admin/CommentModerationPage.jsx'));
const CouponListPage = lazy(() => import('./pages/admin/CouponListPage.jsx'));
const CouponFormPage = lazy(() => import('./pages/admin/CouponFormPage.jsx'));
const CategoryListPage = lazy(() => import('./pages/admin/CategoryListPage.jsx'));
const TagListPage = lazy(() => import('./pages/admin/TagListPage.jsx'));
const VehicleListPage = lazy(() => import('./pages/admin/VehicleListPage.jsx'));
const VehicleFormPage = lazy(() => import('./pages/admin/VehicleFormPage.jsx'));
const VehicleModelListPage = lazy(() => import('./pages/admin/VehicleModelListPage.jsx'));
const BookingListPage = lazy(() => import('./pages/admin/BookingListPage.jsx'));
const BookingDetailAdminPage = lazy(() => import('./pages/admin/BookingDetailAdminPage.jsx'));
const UserListPage = lazy(() => import('./pages/admin/UserListPage.jsx'));
const UserDetailPage = lazy(() => import('./pages/admin/UserDetailPage.jsx'));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage.jsx'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage.jsx'));
const ContactMessageListPage = lazy(() => import('./pages/admin/ContactMessageListPage.jsx'));
const RescueStationListPage = lazy(() => import('./pages/admin/RescueStationListPage.jsx'));
const AgentApplicationListPage = lazy(() => import('./pages/admin/AgentApplicationListPage.jsx'));
const SosRequestListPage = lazy(() => import('./pages/admin/SosRequestListPage.jsx'));
const CorporateClientListPage = lazy(() => import('./pages/admin/corporate/ClientListPage.jsx'));
const CorporateClientDetailPage = lazy(() => import('./pages/admin/corporate/ClientDetailPage.jsx'));
const CorporateBookingQueuePage = lazy(() => import('./pages/admin/corporate/BookingQueuePage.jsx'));

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading label="Đang tải trang..." />}>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/cars" element={<CarListPage />} />
            <Route path="/cars/:id" element={<CarDetailPage />} />
            <Route path="/magazine" element={<BlogListPage />} />
            <Route path="/magazine/:slug" element={<BlogDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/roadside" element={<RoadsidePage />} />
            <Route path="/agent" element={<AgentRegisterPage />} />
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
            {/* Day 39 (UC-34/35) — roadside SOS wizard for an in-use booking */}
            <Route
              path="/sos/:bookingId"
              element={
                <ProtectedRoute>
                  <SOSPage />
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
            <Route index element={<DashboardPage />} />
            <Route path="vehicles" element={<VehicleListPage />} />
            <Route path="vehicles/new" element={<VehicleFormPage />} />
            <Route path="vehicles/:id" element={<VehicleFormPage />} />
            <Route path="vehicle-models" element={<VehicleModelListPage />} />
            <Route path="bookings" element={<BookingListPage />} />
            <Route path="bookings/:id" element={<BookingDetailAdminPage />} />
            <Route path="corporate/clients" element={<CorporateClientListPage />} />
            <Route path="corporate/clients/:id" element={<CorporateClientDetailPage />} />
            <Route path="corporate/bookings" element={<CorporateBookingQueuePage />} />
            <Route path="users" element={<UserListPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="posts" element={<PostListPage />} />
            <Route path="posts/new" element={<PostFormPage />} />
            <Route path="posts/:id" element={<PostFormPage />} />
            <Route path="post-categories" element={<CategoryListPage />} />
            <Route path="tags" element={<TagListPage />} />
            <Route path="comments" element={<CommentModerationPage />} />
            <Route path="contact-messages" element={<ContactMessageListPage />} />
            <Route path="rescue-stations" element={<RescueStationListPage />} />
            <Route path="agent-applications" element={<AgentApplicationListPage />} />
            <Route path="sos-requests" element={<SosRequestListPage />} />
            <Route path="coupons" element={<CouponListPage />} />
            <Route path="coupons/new" element={<CouponFormPage />} />
            <Route path="coupons/:id" element={<CouponFormPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
