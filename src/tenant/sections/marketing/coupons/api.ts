import { api } from '../../../../api/client';
import type { Coupon } from '../../../../types';

export const couponsApi = {
  async getCoupons(): Promise<Coupon[]> {
    const { data } = await api.get<Coupon[]>('/coupons');
    return data;
  },

  async createCoupon(input: {
    code: string;
    type: Coupon['type'];
    value: number;
    maxUses?: number;
    expiresAt?: string;
  }): Promise<Coupon> {
    const { data } = await api.post<Coupon>('/coupons', input);
    return data;
  },

  async deactivateCoupon(id: string): Promise<Coupon> {
    const { data } = await api.delete<Coupon>(`/coupons/${id}`);
    return data;
  },
};
