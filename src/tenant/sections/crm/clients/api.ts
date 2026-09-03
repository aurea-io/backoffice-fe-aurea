import { api } from '../../../../api/client';
import type { Client } from '../../../../types';

export const clientsApi = {
  async getClients(search?: string): Promise<Client[]> {
    const { data } = await api.get<Client[]>('/clients', { params: search ? { search } : undefined });
    return data;
  },

  async createClient(input: Pick<Client, 'name' | 'email' | 'phone'>): Promise<Client> {
    const { data } = await api.post<Client>('/clients', input);
    return data;
  },

  async addClientNote(id: string, body: string) {
    const { data } = await api.post(`/clients/${id}/notes`, { body });
    return data;
  },
};
