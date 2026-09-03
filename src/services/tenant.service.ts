import { api } from '../api/client';
import type { TenantContext, TenantSettings, TenantMember, TenantBilling, TenantAnalytics, Role } from '../types';

export interface BrandingVersion {
  version: number;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  fontFamily: string;
  logoUrl: string | null;
  coverUrl: string | null;
  layoutTokens?: unknown;
  overrides?: unknown;
  createdAt: string;
}

export const tenantService = {
  async getContext(tenantId?: string): Promise<TenantContext> {
    const headers = tenantId ? { 'x-tenant-id': tenantId } : undefined;
    const { data } = await api.get<TenantContext>('/tenant/context', { headers });
    return data;
  },

  async updateSettings(settings: TenantSettings): Promise<TenantContext> {
    const { data } = await api.patch<TenantContext>('/tenant/settings', { settings });
    return data;
  },

  async getBrandingVersions(): Promise<BrandingVersion[]> {
    const { data } = await api.get<BrandingVersion[]>('/tenant/branding/versions');
    return data;
  },

  async rollbackBranding(version: number): Promise<BrandingVersion> {
    const { data } = await api.post<BrandingVersion>(`/tenant/branding/rollback/${version}`);
    return data;
  },

  async getMembers(): Promise<TenantMember[]> {
    const { data } = await api.get<TenantMember[]>('/tenant/members');
    return data;
  },

  async addMember(email: string, role: Role = 'STAFF', permissions: string[] = []): Promise<TenantMember> {
    const { data } = await api.post<TenantMember>('/tenant/members', { email, role, permissions });
    return data;
  },

  async updateMember(userId: string, input: Partial<Pick<TenantMember, 'role' | 'permissions' | 'isActive'>> & { roleKey?: string }) {
    const { data } = await api.patch<TenantMember>(`/tenant/members/${userId}`, input);
    return data;
  },

  async removeMember(userId: string) {
    const { data } = await api.delete<{ success: boolean }>(`/tenant/members/${userId}`);
    return data;
  },

  async getBilling(): Promise<TenantBilling> {
    const { data } = await api.get<TenantBilling>('/tenant/billing');
    return data;
  },

  async getAnalytics(): Promise<TenantAnalytics> {
    const { data } = await api.get<TenantAnalytics>('/tenant/analytics');
    return data;
  },

  async getNavigation() {
    const { data } = await api.get<{
      sections: Array<{
        id: string;
        name: string;
        description?: string;
        pages: Array<{
          id: string;
          name: string;
          path: string;
          feature?: string;
          modules: Array<{ key: string; name: string; description?: string }>;
        }>;
      }>;
    }>('/tenant/navigation');
    return data;
  },
};
