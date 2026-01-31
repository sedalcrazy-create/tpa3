import apiClient from './client';
import type { PaginatedResponse, PaginationParams } from '../types/api';
import type { Center, CenterDoctor } from '../types/center';

// Re-export the types so consumers can import from a single place
export type { Center, CenterDoctor };

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
export const centersApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Center>>('/centers', { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<{ data: Center }>(`/centers/${id}`).then((r) => r.data.data),

  create: (data: Partial<Center>) =>
    apiClient.post<{ data: Center }>('/centers', data).then((r) => r.data.data),

  update: (id: number, data: Partial<Center>) =>
    apiClient.put<{ data: Center }>(`/centers/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete(`/centers/${id}`),

  addDoctor: (centerId: number, data: Partial<CenterDoctor>) =>
    apiClient.post<{ data: CenterDoctor }>(`/centers/${centerId}/doctors`, data).then((r) => r.data.data),

  updateDoctor: (centerId: number, doctorId: number, data: Partial<CenterDoctor>) =>
    apiClient.put<{ data: CenterDoctor }>(`/centers/${centerId}/doctors/${doctorId}`, data).then((r) => r.data.data),

  deleteDoctor: (centerId: number, doctorId: number) =>
    apiClient.delete(`/centers/${centerId}/doctors/${doctorId}`),
};
