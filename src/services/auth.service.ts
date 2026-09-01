import { api } from '../api/client';
import type { AuthResponse, UserContextResponse, CapabilityResponse, User } from '../types';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  name: string;
  invitationCode: string;
  avatarUrl?: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  async refresh(): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/refresh', {});
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout', {});
  },

  async getMe(tenantId?: string): Promise<UserContextResponse> {
    const headers = tenantId ? { 'x-tenant-id': tenantId } : undefined;
    const { data } = await api.get<UserContextResponse>('/auth/me', { headers });
    return data;
  },

  async getCapabilities(tenantId: string): Promise<CapabilityResponse> {
    const { data } = await api.get<CapabilityResponse>('/auth/me/capabilities', {
      headers: { 'x-tenant-id': tenantId },
    });
    return data;
  },

  async updateProfile(payload: { name?: string; avatarUrl?: string }): Promise<User> {
    const { data } = await api.patch<User>('/auth/profile', payload);
    return data;
  },

  async requestMagicLink(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/magic-link', { email });
    return data;
  },

  async verifyMagicLink(token: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/magic-link/verify', { token });
    return data;
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/password-reset', { email });
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post<{ success: boolean; message: string }>('/auth/password-reset/verify', {
      token,
      newPassword,
    });
    return data;
  },
};
