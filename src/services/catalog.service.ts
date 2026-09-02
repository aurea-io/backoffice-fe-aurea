import { api } from '../api/client';
import type { CatalogCategory, CatalogItem, CatalogModifierGroup, CreateCatalogItemInput, UpdateCatalogItemInput } from '../types';

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

  async getCategories(): Promise<CatalogCategory[]> { const { data } = await api.get<CatalogCategory[]>('/catalog/categories'); return data; },
  async createCategory(payload: { name: string; parentId?: string }): Promise<CatalogCategory> { const { data } = await api.post<CatalogCategory>('/catalog/categories', payload); return data; },
  async updateCategory(id: string, payload: { name?: string; parentId?: string; isActive?: boolean }): Promise<CatalogCategory> { const { data } = await api.patch<CatalogCategory>(`/catalog/categories/${id}`, payload); return data; },
  async removeCategory(id: string): Promise<void> { await api.delete(`/catalog/categories/${id}`); },
  async getModifierGroups(): Promise<CatalogModifierGroup[]> { const { data } = await api.get<CatalogModifierGroup[]>('/catalog/modifiers'); return data; },
  async createModifierGroup(payload: { name: string; minSelections?: number; maxSelections?: number; options?: Array<{ name: string; priceDeltaCents?: number }> }): Promise<CatalogModifierGroup> { const { data } = await api.post<CatalogModifierGroup>('/catalog/modifiers', payload); return data; },
};
