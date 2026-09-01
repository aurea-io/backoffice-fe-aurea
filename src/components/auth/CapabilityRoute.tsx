import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCapability } from '../../hooks/useCapability';

interface CapabilityRouteProps {
  capability: string;
}

/** Protects a route with the effective capability returned by the backend. */
export function CapabilityRoute({ capability }: CapabilityRouteProps) {
  const location = useLocation();
  const { hasCapability } = useCapability();

  if (!hasCapability(capability)) {
    return <Navigate to="/dashboard" replace state={{ from: location, deniedCapability: capability }} />;
  }

  return <Outlet />;
}
