import { api } from '../../../../api/client';
import type { Booking } from '../../../../types';

export const bookingsApi = {
  async getBookings(from?: string, to?: string): Promise<Booking[]> {
    const { data } = await api.get<Booking[]>('/bookings', { params: { from, to } });
    return data;
  },

  async updateBooking(id: string, status: Booking['status']): Promise<Booking> {
    const { data } = await api.patch<Booking>(`/bookings/${id}`, { status });
    return data;
  },
};
