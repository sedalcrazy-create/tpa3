import apiClient from './client';
import type { PaginatedResponse, PaginationParams } from '../types/api';

export interface Contract {
  id: number;
  contract_number: string;
  title: string;
  start_date: string;
  end_date: string;
  center_id: number;
  center_name?: string;
  max_ceiling: number;
  status: string;
  status_title?: string;
  is_active: boolean;
  created_at?: string;
}

export const contractsApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Contract>>('/contracts', { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<{ data: Contract }>(`/contracts/${id}`).then((r) => r.data.data),

  create: (data: Partial<Contract>) =>
    apiClient.post<{ data: Contract }>('/contracts', data).then((r) => r.data.data),

  update: (id: number, data: Partial<Contract>) =>
    apiClient.put<{ data: Contract }>(`/contracts/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete(`/contracts/${id}`),
};
