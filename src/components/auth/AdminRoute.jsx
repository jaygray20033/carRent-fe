// src/components/auth/AdminRoute.jsx
// Route guard for the admin area — requires a logged-in ADMIN or OPERATOR.
// Non-authenticated users go to /login; authenticated non-admins go home.
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';

const ADMIN_ROLES = ['ADMIN', 'OPERATOR'];

export default function AdminRoute({ children }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const roleCode = user?.role?.code || user?.role;
  if (!ADMIN_ROLES.includes(roleCode)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
