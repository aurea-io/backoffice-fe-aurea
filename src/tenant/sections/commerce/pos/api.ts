import { api } from '../../../../api/client';
import type { CashSession } from '../../../../types';

export const posApi = {
  async getCash(): Promise<CashSession | null> {
    const { data } = await api.get<CashSession | null>('/pos/cash');
    return data;
  },

  async openCash(openingCents: number): Promise<CashSession> {
    const { data } = await api.post<CashSession>('/pos/cash/open', { openingCents });
    return data;
  },

  async closeCash(closingCents: number, notes?: string): Promise<CashSession> {
    const { data } = await api.post<CashSession>('/pos/cash/close', { closingCents, notes });
    return data;
  },
};
