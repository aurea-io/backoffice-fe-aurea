import { api } from '../api/client';
import type { PaymentIntent } from '../types';

export const paymentsService = {
  async createPaymentIntent(input: {
    provider: string;
    amountCents: number;
    currency: string;
    referenceType?: string;
    referenceId?: string;
    returnUrl?: string;
  }): Promise<PaymentIntent> {
    const { data } = await api.post<PaymentIntent>('/payments/intents', input);
    return data;
  },
};
