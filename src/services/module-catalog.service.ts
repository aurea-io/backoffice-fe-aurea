import { api } from '../api/client';
import type { ModuleCatalogResponse } from '../types';

export const moduleCatalogService = {
  async getCatalog(): Promise<ModuleCatalogResponse> {
    const { data } = await api.get<ModuleCatalogResponse>('/superadmin/modules');
    return data;
  },
};
