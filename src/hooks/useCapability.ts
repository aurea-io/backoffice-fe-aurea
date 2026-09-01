import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTenantStore } from '../store/tenantStore';

/** Resolves effective capabilities from the server-provided tenant context. */
export function useCapability() {
  const isSuperadmin = useAuthStore((state) => state.isSuperadmin);
  const currentTenant = useTenantStore((state) => state.currentTenant);
  const capabilities = useTenantStore((state) => state.capabilities);

  const hasCapability = useCallback(
    (capability: string) => {
      if (isSuperadmin || currentTenant?.role === 'SUPERADMIN') return true;
      if (capabilities[capability] !== undefined) return capabilities[capability];
      return currentTenant?.permissions.includes(capability) === true ||
        currentTenant?.activeFeatures.includes(capability) === true;
    },
    [capabilities, currentTenant, isSuperadmin],
  );

  const hasAnyCapability = useCallback(
    (capabilities: string[]) => capabilities.some(hasCapability),
    [hasCapability],
  );

  const hasAllCapabilities = useCallback(
    (capabilities: string[]) => capabilities.every(hasCapability),
    [hasCapability],
  );

  return { hasCapability, hasAnyCapability, hasAllCapabilities };
}
