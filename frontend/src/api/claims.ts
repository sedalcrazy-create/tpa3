import apiClient from './client';
import type { PaginatedResponse, PaginationParams } from '../types/api';
import type { Claim } from '../types/claim';

// Re-export the types so consumers can import from a single place
export type { Claim };

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
export const claimsApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Claim>>('/claims', { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<{ data: Claim }>(`/claims/${id}`).then((r) => r.data.data),

  create: (data: Partial<Claim>) =>
    apiClient.post<{ data: Claim }>('/claims', data).then((r) => r.data.data),

  update: (id: number, data: Partial<Claim>) =>
    apiClient.put<{ data: Claim }>(`/claims/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete(`/claims/${id}`),

  transition: (id: number, data: { status: string; note?: string }) =>
    apiClient.post<{ data: Claim }>(`/claims/${id}/transition`, data).then((r) => r.data.data),

  addNote: (id: number, data: { note: string }) =>
    apiClient.post<{ data: Claim }>(`/claims/${id}/notes`, data).then((r) => r.data.data),

  addAttachment: (id: number, formData: FormData) =>
    apiClient.post<{ data: Claim }>(`/claims/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data),

  deleteAttachment: (id: number, attachmentId: number) =>
    apiClient.delete(`/claims/${id}/attachments/${attachmentId}`),

  nextStatuses: (id: number) =>
    apiClient.get<{ data: string[] }>(`/claims/${id}/next-statuses`).then((r) => r.data.data),
};
