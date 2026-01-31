import apiClient from './client';
import type { PaginatedResponse, PaginationParams } from '../types/api';
import type { Settlement } from '../types/center';

// Re-export the types so consumers can import from a single place
export type { Settlement };

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
export const settlementsApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Settlement>>('/settlements', { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<{ data: Settlement }>(`/settlements/${id}`).then((r) => r.data.data),

  approve: (id: number) =>
    apiClient.post<{ data: Settlement }>(`/settlements/${id}/approve`).then((r) => r.data.data),

  pay: (id: number, data: { payment_date: string; payment_reference?: string }) =>
    apiClient.post<{ data: Settlement }>(`/settlements/${id}/pay`, data).then((r) => r.data.data),

  aggregate: (params?: PaginationParams) =>
    apiClient.get<{ data: Record<string, unknown> }>('/settlements/aggregate', { params }).then((r) => r.data.data),
};
