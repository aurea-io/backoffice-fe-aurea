import { api } from '../api/client';
import type { Invitation, CreateInvitationInput } from '../types';

export const invitationsService = {
  async create(data: CreateInvitationInput): Promise<Invitation> {
    const res = await api.post<Invitation>('/invitations', data);
    return res.data;
  },

  async findAll(): Promise<Invitation[]> {
    const res = await api.get<Invitation[]>('/invitations');
    return res.data;
  },

  async revoke(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete<{ success: boolean; message: string }>(`/invitations/${id}`);
    return res.data;
  },
};
