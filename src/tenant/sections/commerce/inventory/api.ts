import { api } from '../../../../api/client';
import type { InventoryItem } from '../../../../types';

export const inventoryApi = {
  async getInventory(): Promise<InventoryItem[]> {
    const { data } = await api.get<InventoryItem[]>('/inventory');
    return data;
  },

  async createInventory(input: Pick<InventoryItem, 'name' | 'quantity' | 'minimum'>): Promise<InventoryItem> {
    const { data } = await api.post<InventoryItem>('/inventory', input);
    return data;
  },

  async adjustInventory(id: string, quantity: number, reason?: string): Promise<InventoryItem> {
    const { data } = await api.post<InventoryItem>(`/inventory/${id}/adjust`, { quantity, reason });
    return data;
  },
};
