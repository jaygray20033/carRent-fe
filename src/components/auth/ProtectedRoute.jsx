import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';

export default function ProtectedRoute({ children }) {
  const { accessToken } = useAuthStore();
  const location = useLocation();

  if (!accessToken) {
    // Preserve the full target (path + query) so invite-accept links that carry
    // a ?token=… survive the login round-trip.
    return (
      <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    );
  }
  return children;
}
