import apiClient from './client';
import type { PaginatedResponse, PaginationParams } from '../types/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
export const usersApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<User>>('/users', { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<{ data: User }>(`/users/${id}`).then((r) => r.data.data),

  create: (data: Partial<User> & { password?: string; password_confirmation?: string }) =>
    apiClient.post<{ data: User }>('/users', data).then((r) => r.data.data),

  update: (id: number, data: Partial<User> & { password?: string; password_confirmation?: string }) =>
    apiClient.put<{ data: User }>(`/users/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete(`/users/${id}`),

  toggleActive: (id: number) =>
    apiClient.post<{ data: User }>(`/users/${id}/toggle-active`).then((r) => r.data.data),
};
