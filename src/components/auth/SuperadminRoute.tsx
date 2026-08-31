import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function SuperadminRoute() {
  const { isSuperadmin } = useAuthStore();

  if (!isSuperadmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
