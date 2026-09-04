import { create } from 'zustand';
import type { User, TenantSummary } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  tenants: TenantSummary[];
  isAuthenticated: boolean;
  isInitializing: boolean;

  setAuth: (user: User, accessToken: string, tenants?: TenantSummary[]) => void;
  setAccessToken: (accessToken: string) => void;
  setTenants: (tenants: TenantSummary[]) => void;
  updateUser: (partial: Partial<User>) => void;
  clearAuth: () => void;
  setInitializing: (value: boolean) => void;
}

const STORAGE_KEY = 'aurea-auth-user';

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: loadUser(),
  accessToken: null,
  tenants: [],
  isAuthenticated: !!loadUser(),
  isInitializing: !!loadUser(),

  setAuth: (user, accessToken, tenants = []) => {
    saveUser(user);
    set({
      user,
      accessToken,
      tenants,
      isAuthenticated: true,
      isInitializing: false,
    });
  },

  setAccessToken: (accessToken) => {
    set({ accessToken, isAuthenticated: true, isInitializing: false });
  },

  setTenants: (tenants) => {
    set({ tenants });
  },

  updateUser: (partial) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...partial };
      saveUser(updated);
      return { user: updated };
    });
  },

  clearAuth: () => {
    saveUser(null);
    set({
      user: null,
      accessToken: null,
      tenants: [],
      isAuthenticated: false,
      isInitializing: false,
    });
  },

  setInitializing: (value) => set({ isInitializing: value }),
}));
