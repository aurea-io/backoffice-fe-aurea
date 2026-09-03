import { useCallback } from 'react';
import { useTenantStore } from '../store/tenantStore';

/** Resolves effective capabilities from the server-provided tenant context. */
export function useCapability() {
  const currentTenant = useTenantStore((state) => state.currentTenant);
  const capabilities = useTenantStore((state) => state.capabilities);

  const hasCapability = useCallback(
    (capability: string) => {
      if (capabilities[capability] !== undefined) return capabilities[capability];
      
      // 1. Si la capability está explícitamente activa en el tenant
      if (currentTenant?.activeFeatures?.includes(capability) === true) return true;

      // 2. Si es un permiso de colaborador granular (ej: tenant:employees:read)
      return currentTenant?.permissions?.some((permission) =>
        permission === '*' || permission === 'all' || permission === capability,
      ) === true;
    },
    [capabilities, currentTenant],
  );

  const hasAnyCapability = useCallback(
    (capabilities: string[]) => capabilities.some(hasCapability),
    [hasCapability],
  );

  const hasAllCapabilities = useCallback(
    (capabilities: string[]) => capabilities.every(hasCapability),
    [hasCapability],
  );

  const hasPermission = useCallback(
    (...permissions: string[]) => {
      return permissions.some((permission) => currentTenant?.permissions?.includes(permission) || currentTenant?.permissions?.includes('*') || currentTenant?.permissions?.includes('all'));
    },
    [currentTenant],
  );

  return { hasCapability, hasAnyCapability, hasAllCapabilities, hasPermission };
}
