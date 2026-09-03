import { api } from '../../../api/client';

export interface TenantModuleItem {
  key: string;
  name: string;
  section: string;
  description: string;
  icon: string;
  category: string;
  isEnabled: boolean;
}

export const modulesApi = {
  async getModules(): Promise<TenantModuleItem[]> {
    const { data } = await api.get<TenantModuleItem[]>('/tenant/modules');
    return data;
  },

  async toggleModule(featureKey: string, isEnabled: boolean): Promise<{ featureKey: string; isEnabled: boolean; message: string }> {
    const { data } = await api.patch<{ featureKey: string; isEnabled: boolean; message: string }>(
      `/tenant/modules/${featureKey}/toggle`,
      { isEnabled }
    );
    return data;
  },
};
