import { api } from '../../../../api/client';
import type { RestaurantOrder } from '../../../../types';

export const ordersApi = {
  async getOrders(): Promise<RestaurantOrder[]> {
    const { data } = await api.get<RestaurantOrder[]>('/orders');
    return data;
  },
};
