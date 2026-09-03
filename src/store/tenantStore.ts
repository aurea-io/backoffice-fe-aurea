import { create } from 'zustand';
import type { TenantContext, FeatureKey } from '../types';

export type PlatformMode = 'superadmin' | 'operation';

const ACTIVE_TENANT_KEY = 'aurea-active-tenant-id';
const PLATFORM_MODE_KEY = 'aurea-platform-mode';

interface TenantState {
  currentTenant: TenantContext | null;
  activeTenantId: string | null;
  isLoadingTenant: boolean;
  platformMode: PlatformMode;
  capabilities: Record<string, boolean>;

  setCurrentTenant: (tenant: TenantContext | null) => void;
  setActiveTenantId: (tenantId: string | null) => void;
  setLoadingTenant: (loading: boolean) => void;
  hasFeature: (feature: FeatureKey) => boolean;
  clearTenant: () => void;

  /** Switch to operation mode inside a specific tenant */
  enterTenantOperation: (tenantId: string) => void;
  /** Return to superadmin platform mode */
  returnToPlatform: () => void;
  /** Set the platform mode directly */
  setPlatformMode: (mode: PlatformMode) => void;
  setCapabilities: (capabilities: Record<string, boolean>) => void;
}

function loadActiveTenantId(): string | null {
  try {
    const stored = localStorage.getItem(ACTIVE_TENANT_KEY);
    if (!stored || stored === 'undefined' || stored === 'null') return null;
    return stored;
  } catch {
    return null;
  }
}

function loadPlatformMode(): PlatformMode {
  try {
    const stored = localStorage.getItem(PLATFORM_MODE_KEY);
    if (stored === 'operation') return 'operation';
    return 'superadmin';
  } catch {
    return 'superadmin';
  }
}

export const useTenantStore = create<TenantState>((set, get) => ({
  currentTenant: null,
  activeTenantId: loadActiveTenantId(),
  isLoadingTenant: false,
  platformMode: loadPlatformMode(),
  capabilities: {},

  setCurrentTenant: (tenant) => {
    if (tenant) {
      const resolvedTenantId = tenant.tenantId || (tenant as any).id;
      if (resolvedTenantId && resolvedTenantId !== 'undefined' && resolvedTenantId !== 'null') {
        localStorage.setItem(ACTIVE_TENANT_KEY, resolvedTenantId);
      }
      const safeTenant: TenantContext = {
        ...tenant,
        tenantId: resolvedTenantId || tenant.tenantId,
        activeFeatures: tenant.activeFeatures || [],
        permissions: tenant.permissions || [],
      };
      set({
        currentTenant: safeTenant,
        activeTenantId: resolvedTenantId || null,
        isLoadingTenant: false,
        capabilities: {},
      });
    } else {
      localStorage.removeItem(ACTIVE_TENANT_KEY);
      set({ currentTenant: null, activeTenantId: null, isLoadingTenant: false, capabilities: {} });
    }
  },

  setActiveTenantId: (tenantId) => {
    if (tenantId && tenantId !== 'undefined' && tenantId !== 'null') {
      localStorage.setItem(ACTIVE_TENANT_KEY, tenantId);
      set({ activeTenantId: tenantId });
    } else {
      localStorage.removeItem(ACTIVE_TENANT_KEY);
      set({ activeTenantId: null, currentTenant: null });
    }
  },

  setLoadingTenant: (loading) => set({ isLoadingTenant: loading }),

  setCapabilities: (capabilities) => set({ capabilities }),

  hasFeature: (feature) => {
    const current = get().currentTenant;
    if (!current) return false;
    if (current.role === 'SUPERADMIN') return true;
    return current.activeFeatures?.includes(feature) ?? false;
  },

  clearTenant: () => {
    localStorage.removeItem(ACTIVE_TENANT_KEY);
    localStorage.removeItem(PLATFORM_MODE_KEY);
    set({ currentTenant: null, activeTenantId: null, isLoadingTenant: false, capabilities: {}, platformMode: 'superadmin' });
  },

  enterTenantOperation: (tenantId) => {
    localStorage.setItem(ACTIVE_TENANT_KEY, tenantId);
    localStorage.setItem(PLATFORM_MODE_KEY, 'operation');
    set({ activeTenantId: tenantId, platformMode: 'operation' });
  },

  returnToPlatform: () => {
    localStorage.setItem(PLATFORM_MODE_KEY, 'superadmin');
    set({ platformMode: 'superadmin', currentTenant: null, activeTenantId: null });
    localStorage.removeItem(ACTIVE_TENANT_KEY);
  },

  setPlatformMode: (mode) => {
    localStorage.setItem(PLATFORM_MODE_KEY, mode);
    set({ platformMode: mode });
  },
}));
