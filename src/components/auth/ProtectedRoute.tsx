import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { FullPageLoader } from '../common/LoadingSpinner';
import { Button } from '../ui/Button';

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isInitializing } = useAuthStore();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isInitializing) {
      setTimedOut(false);
      return undefined;
    }
    const timeout = window.setTimeout(() => setTimedOut(true), 12000);
    return () => window.clearTimeout(timeout);
  }, [isInitializing]);

  if (isInitializing) {
    return (
      <FullPageLoader
        message={timedOut ? 'La verificación está tardando más de lo esperado.' : 'Verificando sesión en Aurea...'}
        action={timedOut ? (
          <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        ) : undefined}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
