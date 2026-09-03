import { api } from '../../../../api/client';
import type { RestaurantOrder } from '../../../../types';

export const ordersApi = {
  async getOrders(): Promise<RestaurantOrder[]> {
    const { data } = await api.get<RestaurantOrder[]>('/orders');
    return data;
  },

  async createOrder(dto: any): Promise<RestaurantOrder> {
    const { data } = await api.post<RestaurantOrder>('/orders', dto);
    return data;
  },
};
