import { api } from '../api/client';
import type { TenantContext, TenantSettings, TenantMember, Role } from '../types';

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

  async addMember(email: string, role: Role = 'STAFF'): Promise<TenantMember> {
    const { data } = await api.post<TenantMember>('/tenant/members', { email, role });
    return data;
  },
};
