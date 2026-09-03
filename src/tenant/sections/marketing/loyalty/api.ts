import { api } from '../../../../api/client';
import type { LoyaltyAccount } from '../../../../types';

export const loyaltyApi = {
  async getLoyalty(): Promise<LoyaltyAccount[]> {
    const { data } = await api.get<LoyaltyAccount[]>('/loyalty');
    return data;
  },

  async operateLoyalty(customerId: string, points: number, operation: 'earn' | 'redeem'): Promise<LoyaltyAccount> {
    const { data } = await api.post<LoyaltyAccount>('/loyalty/operations', { customerId, points, operation });
    return data;
  },
};
