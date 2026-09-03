import { api } from '../../../../api/client';
import type { RestaurantOrder } from '../../../../types';

export const kitchenApi = {
  async getKitchenOrders(): Promise<RestaurantOrder[]> {
    const { data } = await api.get<RestaurantOrder[]>('/kitchen');
    return data;
  },

  async updateKitchenOrder(id: string, status: RestaurantOrder['status']): Promise<RestaurantOrder> {
    const { data } = await api.patch<RestaurantOrder>(`/kitchen/orders/${id}`, { status });
    return data;
  },
};
