import { create } from 'zustand';
import type { TenantContext, FeatureKey } from '../types';

import type { NavigationSection } from '../types/navigation.types';

export type PlatformMode = 'operation';

const ACTIVE_TENANT_KEY = 'aurea-active-tenant-id';
const PLATFORM_MODE_KEY = 'aurea-platform-mode';
const NAVIGATION_CACHE_KEY = 'aurea-navigation-cache';

interface TenantState {
  currentTenant: TenantContext | null;
  activeTenantId: string | null;
  isLoadingTenant: boolean;
  platformMode: PlatformMode;
  capabilities: Record<string, boolean>;
  navigation: NavigationSection[];

  setCurrentTenant: (tenant: TenantContext | null) => void;
  setActiveTenantId: (tenantId: string | null) => void;
  setLoadingTenant: (loading: boolean) => void;
  hasFeature: (feature: FeatureKey) => boolean;
  clearTenant: () => void;
  setNavigation: (navigation: NavigationSection[]) => void;

  /** Switch to operation mode inside a specific tenant */
  enterTenantOperation: (tenantId: string) => void;
  /** Return to platform mode */
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
    return 'operation';
  } catch {
    return 'operation';
  }
}

function loadNavigationCache(): NavigationSection[] {
  try {
    const raw = localStorage.getItem(NAVIGATION_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const useTenantStore = create<TenantState>((set, get) => ({
  currentTenant: null,
  activeTenantId: loadActiveTenantId(),
  isLoadingTenant: false,
  platformMode: loadPlatformMode(),
  capabilities: {},
  navigation: loadNavigationCache(),

  setCurrentTenant: (tenant) => {
    if (tenant) {
      const resolvedTenantId = [
        tenant.tenantId,
        (tenant as TenantContext & { id?: string }).id,
      ].find(
        (id): id is string => Boolean(id) && id !== 'undefined' && id !== 'null',
      );
      if (!resolvedTenantId) {
        localStorage.removeItem(ACTIVE_TENANT_KEY);
        set({ currentTenant: null, activeTenantId: null, isLoadingTenant: false, capabilities: {} });
        return;
      }
      localStorage.setItem(ACTIVE_TENANT_KEY, resolvedTenantId);
      const safeTenant: TenantContext = {
        ...tenant,
        tenantId: resolvedTenantId,
        activeFeatures: tenant.activeFeatures || [],
        permissions: tenant.permissions || [],
      };
      set({
        currentTenant: safeTenant,
        activeTenantId: resolvedTenantId,
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
    return current.activeFeatures?.includes(feature) ?? false;
  },

  clearTenant: () => {
    localStorage.removeItem(ACTIVE_TENANT_KEY);
    localStorage.removeItem(PLATFORM_MODE_KEY);
    localStorage.removeItem(NAVIGATION_CACHE_KEY);
    set({
      currentTenant: null,
      activeTenantId: null,
      isLoadingTenant: false,
      capabilities: {},
      navigation: [],
      platformMode: 'operation',
    });
  },

  setNavigation: (navigation) => {
    try {
      localStorage.setItem(NAVIGATION_CACHE_KEY, JSON.stringify(navigation));
    } catch {
      // ignore
    }
    set({ navigation });
  },

  enterTenantOperation: (tenantId) => {
    localStorage.setItem(ACTIVE_TENANT_KEY, tenantId);
    localStorage.setItem(PLATFORM_MODE_KEY, 'operation');
    set({ activeTenantId: tenantId, platformMode: 'operation' });
  },

  returnToPlatform: () => {
    localStorage.setItem(PLATFORM_MODE_KEY, 'operation');
    set({ platformMode: 'operation', currentTenant: null, activeTenantId: null });
    localStorage.removeItem(ACTIVE_TENANT_KEY);
  },

  setPlatformMode: (mode) => {
    localStorage.setItem(PLATFORM_MODE_KEY, mode);
    set({ platformMode: mode });
  },
}));
