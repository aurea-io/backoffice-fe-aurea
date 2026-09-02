import { api } from '../api/client';
import type { TenantContext, TenantSettings, TenantMember, TenantBilling, TenantAnalytics, Booking, InventoryItem, RestaurantTable, RestaurantOrder, CashSession, Role, Client, TableQr } from '../types';

export const tenantService = {
  async getContext(tenantId?: string): Promise<TenantContext> {
    const headers = tenantId ? { 'x-tenant-id': tenantId } : undefined;
    const { data } = await api.get<TenantContext>('/tenant/context', { headers });
    return data;
  },

  async updateSettings(settings: TenantSettings): Promise<TenantContext> {
    const { data } = await api.patch<TenantContext>('/tenant/settings', { settings });
    return data;
  },

  async getMembers(): Promise<TenantMember[]> {
    const { data } = await api.get<TenantMember[]>('/tenant/members');
    return data;
  },

  async getBilling(): Promise<TenantBilling> {
    const { data } = await api.get<TenantBilling>('/tenant/billing');
    return data;
  },

  async getBookings(from?: string, to?: string): Promise<Booking[]> {
    const { data } = await api.get<Booking[]>('/appointments', { params: { from, to } });
    return data;
  },

  async updateBooking(id: string, input: Partial<Pick<Booking, 'status' | 'paymentStatus'>>): Promise<Booking> {
    const { data } = await api.patch<Booking>(`/appointments/${id}`, input);
    return data;
  },

  async getInventory(): Promise<InventoryItem[]> {
    const { data } = await api.get<InventoryItem[]>('/inventory'); return data;
  },

  async createInventory(input: Pick<InventoryItem, 'name' | 'quantity'> & Partial<Pick<InventoryItem, 'unit' | 'minimum' | 'costCents'>>): Promise<InventoryItem> {
    const { data } = await api.post<InventoryItem>('/inventory', input); return data;
  },

  async adjustInventory(id: string, quantity: number, reason?: string): Promise<InventoryItem> {
    const { data } = await api.post<InventoryItem>(`/inventory/${id}/adjust`, { quantity, reason }); return data;
  },

  async getTables(): Promise<RestaurantTable[]> { const { data } = await api.get<RestaurantTable[]>('/restaurant/tables'); return data; },
  async updateTable(id: string, status: RestaurantTable['status']): Promise<RestaurantTable> { const { data } = await api.patch<RestaurantTable>(`/restaurant/tables/${id}`, { status }); return data; },
  async getTableQr(id: string): Promise<TableQr> { const { data } = await api.get<TableQr>(`/restaurant/tables/${id}/qr`); return data; },
  async getOrders(): Promise<RestaurantOrder[]> { const { data } = await api.get<RestaurantOrder[]>('/restaurant/orders'); return data; },
  async getKitchenOrders(): Promise<RestaurantOrder[]> { const { data } = await api.get<RestaurantOrder[]>('/restaurant/kitchen'); return data; },
  async updateKitchenOrder(id: string, status: RestaurantOrder['status']): Promise<RestaurantOrder> { const { data } = await api.patch<RestaurantOrder>(`/restaurant/kitchen/orders/${id}`, { status }); return data; },
  async getCash(): Promise<CashSession | null> { const { data } = await api.get<CashSession | null>('/pos/cash'); return data; },
  async openCash(openingCents: number): Promise<CashSession> { const { data } = await api.post<CashSession>('/pos/cash/open', { openingCents }); return data; },
  async closeCash(closingCents: number, notes?: string): Promise<CashSession> { const { data } = await api.post<CashSession>('/pos/cash/close', { closingCents, notes }); return data; },
  async getAnalytics(): Promise<TenantAnalytics> { const { data } = await api.get<TenantAnalytics>('/tenant/analytics'); return data; },
  async getClients(search?: string): Promise<Client[]> { const { data } = await api.get<Client[]>('/clients', { params: search ? { search } : undefined }); return data; },
  async createClient(input: Pick<Client, 'name' | 'email' | 'phone'>): Promise<Client> { const { data } = await api.post<Client>('/clients', input); return data; },
  async addClientNote(id: string, body: string) { const { data } = await api.post(`/clients/${id}/notes`, { body }); return data; },

  async addMember(email: string, role: Role = 'STAFF', permissions: string[] = []): Promise<TenantMember> {
    const { data } = await api.post<TenantMember>('/tenant/members', { email, role, permissions });
    return data;
  },

  async updateMember(userId: string, input: Partial<Pick<TenantMember, 'role' | 'permissions' | 'isActive'>> & { roleKey?: string }) {
    const { data } = await api.patch<TenantMember>(`/tenant/members/${userId}`, input);
    return data;
  },

  async removeMember(userId: string) {
    const { data } = await api.delete<{ success: boolean }>(`/tenant/members/${userId}`);
    return data;
  },
};
