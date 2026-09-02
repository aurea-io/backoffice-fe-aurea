import { useMemo } from 'react';
import { useCapability } from './useCapability';

export interface DomainPermissions {
  isEnabled: boolean;
  canRead: boolean;
  canWrite: boolean;
  hasCapability: (capability: string) => boolean;
  hasPermission: (...permissions: string[]) => boolean;
}

/**
 * Hook to resolve capabilities and access levels by domain namespace.
 * Example:
 * const { isEnabled, canRead, canWrite } = useDomainPermissions('catalog');
 * or
 * const { isEnabled, canRead, canWrite } = useDomainPermissions('commerce.catalog');
 */
export function useDomainPermissions(domain: string): DomainPermissions {
  const { hasCapability, hasPermission } = useCapability();

  return useMemo(() => {
    const shortDomain = domain.split('.').pop() ?? domain;

    // Check if the domain feature is enabled
    const isEnabled =
      hasCapability(domain) ||
      hasCapability(shortDomain) ||
      hasCapability(`${domain}.read`) ||
      hasCapability(`${shortDomain}.read`);

    // Check read permission
    const canRead =
      isEnabled &&
      hasPermission(
        `${domain}:read`,
        `${domain}.read`,
        `${domain}.view`,
        `${domain}:view`,
        `${shortDomain}:read`,
        `${shortDomain}.read`,
        `${shortDomain}.view`,
        `${shortDomain}:view`,
        `${shortDomain}:write`,
        `${domain}:write`,
      );

    // Check write permission
    const canWrite =
      isEnabled &&
      hasPermission(
        `${domain}:write`,
        `${domain}.write`,
        `${domain}.manage`,
        `${domain}:manage`,
        `${shortDomain}:write`,
        `${shortDomain}.write`,
        `${shortDomain}:manage`,
        `${shortDomain}:manage`,
      );

    return {
      isEnabled,
      canRead,
      canWrite,
      hasCapability,
      hasPermission,
    };
  }, [domain, hasCapability, hasPermission]);
}
