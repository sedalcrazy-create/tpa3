import apiClient from './client';
import type { PaginatedResponse, PaginationParams } from '../types/api';
import type { Insurance, InsuranceInquiry } from '../types/insurance';

export const insurancesApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Insurance>>('/insurances', { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<{ data: Insurance }>(`/insurances/${id}`).then((r) => r.data.data),

  create: (data: Partial<Insurance>) =>
    apiClient.post<{ data: Insurance }>('/insurances', data).then((r) => r.data.data),

  update: (id: number, data: Partial<Insurance>) =>
    apiClient.put<{ data: Insurance }>(`/insurances/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete(`/insurances/${id}`),

  inquiry: (nationalCode: string) =>
    apiClient
      .get<{ data: InsuranceInquiry }>('/insurances/inquiry', { params: { national_code: nationalCode } })
      .then((r) => r.data.data),
};
