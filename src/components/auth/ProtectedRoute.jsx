import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';

export default function ProtectedRoute({ children }) {
  const { accessToken } = useAuthStore();
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
