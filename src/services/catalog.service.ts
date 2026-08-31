import { api } from '../api/client';
import type { CatalogItem, CreateCatalogItemInput, UpdateCatalogItemInput } from '../types';

export const catalogService = {
  async getAll(params?: { category?: string; isService?: boolean }): Promise<CatalogItem[]> {
    const queryParams: Record<string, string> = {};
    if (params?.category) queryParams.category = params.category;
    if (params?.isService !== undefined) queryParams.isService = String(params.isService);

    const { data } = await api.get<CatalogItem[]>('/catalog', { params: queryParams });
    return data;
  },

  async getOne(id: string): Promise<CatalogItem> {
    const { data } = await api.get<CatalogItem>(`/catalog/${id}`);
    return data;
  },

  async create(payload: CreateCatalogItemInput): Promise<CatalogItem> {
    const { data } = await api.post<CatalogItem>('/catalog', payload);
    return data;
  },

  async update(id: string, payload: UpdateCatalogItemInput): Promise<CatalogItem> {
    const { data } = await api.patch<CatalogItem>(`/catalog/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/catalog/${id}`);
  },
};
