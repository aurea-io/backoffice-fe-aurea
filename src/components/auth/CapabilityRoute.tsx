import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCapability } from '../../hooks/useCapability';

interface CapabilityRouteProps {
  capability: string;
  permission?: string | string[];
}

/** Protects a route with the effective capability returned by the backend. */
export function CapabilityRoute({ capability, permission }: CapabilityRouteProps) {
  const location = useLocation();
  const { hasCapability, hasPermission } = useCapability();
  const requiredPermissions = permission ? (Array.isArray(permission) ? permission : [permission]) : [];

  if (!hasCapability(capability) || (requiredPermissions.length > 0 && !hasPermission(...requiredPermissions))) {
    return <Navigate to="/dashboard" replace state={{ from: location, deniedCapability: capability }} />;
  }

  return <Outlet />;
}
