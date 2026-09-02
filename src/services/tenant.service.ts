import { api } from '../api/client';
import type { TenantContext, TenantSettings, TenantMember, TenantBilling, Role } from '../types';

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

  async getMembers(): Promise<TenantMember[]> {
    const { data } = await api.get<TenantMember[]>('/tenant/members');
    return data;
  },

  async getBilling(): Promise<TenantBilling> {
    const { data } = await api.get<TenantBilling>('/tenant/billing');
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
};
