import apiClient from './client';
import type { PaginatedResponse, PaginationParams } from '../types/api';

export interface Role {
  id: number;
  name: string;
  title: string;
  description?: string;
  is_active: boolean;
  permissions?: Permission[];
  created_at?: string;
}

export interface Permission {
  id: number;
  name: string;
  title: string;
  group_name?: string;
}

export const rolesApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Role>>('/roles', { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<{ data: Role }>(`/roles/${id}`).then((r) => r.data.data),

  create: (data: Partial<Role> & { permission_ids?: number[] }) =>
    apiClient.post<{ data: Role }>('/roles', data).then((r) => r.data.data),

  update: (id: number, data: Partial<Role> & { permission_ids?: number[] }) =>
    apiClient.put<{ data: Role }>(`/roles/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete(`/roles/${id}`),

  permissions: () =>
    apiClient.get<{ data: Permission[] }>('/permissions').then((r) => r.data.data),
};
