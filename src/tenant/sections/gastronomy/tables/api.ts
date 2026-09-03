import { api } from '../../../../api/client';
import type { RestaurantTable, TableBooking, TableQr } from '../../../../types';

export const tablesApi = {
  async getTables(): Promise<RestaurantTable[]> {
    const { data } = await api.get<RestaurantTable[]>('/tables');
    return data;
  },

  async updateTable(id: string, status: RestaurantTable['status']): Promise<RestaurantTable> {
    const { data } = await api.patch<RestaurantTable>(`/tables/${id}`, { status });
    return data;
  },

  async getTableQr(id: string): Promise<TableQr> {
    const { data } = await api.get<TableQr>(`/tables/${id}/qr`);
    return data;
  },

  async getTableBookings(from?: string, to?: string): Promise<TableBooking[]> {
    const { data } = await api.get<TableBooking[]>('/tables/bookings', { params: { from, to } });
    return data;
  },

  async createTableBooking(input: {
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    date: string;
    startTime: string;
    partySize: number;
    durationMin?: number;
    notes?: string;
    tableId?: string;
  }): Promise<TableBooking> {
    const { data } = await api.post<TableBooking>('/tables/bookings', input);
    return data;
  },

  async updateTableBooking(id: string, input: Partial<TableBooking>): Promise<TableBooking> {
    const { data } = await api.patch<TableBooking>(`/tables/bookings/${id}`, input);
    return data;
  },
};
