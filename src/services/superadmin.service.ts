import { api } from '../api/client';
import type { Tenant, TenantFeature } from '../types';

export interface CreateTenantPayload {
  name: string;
  slug: string;
  vertical: string;
  ownerEmail: string;
  features?: string[];
  settings?: Record<string, unknown>;
}

export interface UpdateTenantPayload {
  name?: string;
  slug?: string;
  vertical?: string;
  isActive?: boolean;
  settings?: Record<string, unknown>;
}

export const superadminService = {
  async getAllTenants(): Promise<Tenant[]> {
    const { data } = await api.get<Tenant[]>('/superadmin/tenants');
    return data;
  },

  async getTenantById(id: string): Promise<Tenant> {
    const { data } = await api.get<Tenant>(`/superadmin/tenants/${id}`);
    return data;
  },

  async createTenant(payload: CreateTenantPayload): Promise<Tenant> {
    const { data } = await api.post<Tenant>('/superadmin/tenants', payload);
    return data;
  },

  async updateTenant(id: string, payload: UpdateTenantPayload): Promise<Tenant> {
    const { data } = await api.patch<Tenant>(`/superadmin/tenants/${id}`, payload);
    return data;
  },

  async deleteTenant(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete<{ success: boolean; message: string }>(`/superadmin/tenants/${id}`);
    return data;
  },

  async assignFeature(
    tenantId: string,
    featureKey: string,
    isEnabled: boolean,
  ): Promise<TenantFeature> {
    const { data } = await api.post<TenantFeature>(`/superadmin/tenants/${tenantId}/features`, {
      featureKey,
      isEnabled,
    });
    return data;
  },

  async batchAssignFeatures(
    tenantId: string,
    features: Array<{ featureKey: string; isEnabled: boolean }>,
  ): Promise<TenantFeature[]> {
    const { data } = await api.put<TenantFeature[]>(`/superadmin/tenants/${tenantId}/features`, {
      features,
    });
    return data;
  },

  async grantSuperAdmin(email: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post<{ success: boolean; message: string }>(
      '/superadmin/users/grant-superadmin',
      { email },
    );
    return data;
  },
};
