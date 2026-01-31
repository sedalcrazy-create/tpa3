import apiClient from './client';
import type { PaginatedResponse, PaginationParams } from '../types/api';
import type { CommissionCase, SocialWork } from '../types/center';

// Re-export the types so consumers can import from a single place
export type { CommissionCase, SocialWork };

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
export const commissionApi = {
  cases: {
    list: (params?: PaginationParams) =>
      apiClient.get<PaginatedResponse<CommissionCase>>('/commission/cases', { params }).then((r) => r.data),

    get: (id: number) =>
      apiClient.get<{ data: CommissionCase }>(`/commission/cases/${id}`).then((r) => r.data.data),

    create: (data: Partial<CommissionCase>) =>
      apiClient.post<{ data: CommissionCase }>('/commission/cases', data).then((r) => r.data.data),

    update: (id: number, data: Partial<CommissionCase>) =>
      apiClient.put<{ data: CommissionCase }>(`/commission/cases/${id}`, data).then((r) => r.data.data),

    addVerdict: (id: number, data: { verdict: string }) =>
      apiClient.post<{ data: CommissionCase }>(`/commission/cases/${id}/verdict`, data).then((r) => r.data.data),
  },

  socialWork: {
    list: (params?: PaginationParams) =>
      apiClient.get<PaginatedResponse<SocialWork>>('/commission/social-work', { params }).then((r) => r.data),

    get: (id: number) =>
      apiClient.get<{ data: SocialWork }>(`/commission/social-work/${id}`).then((r) => r.data.data),

    create: (data: Partial<SocialWork>) =>
      apiClient.post<{ data: SocialWork }>('/commission/social-work', data).then((r) => r.data.data),

    update: (id: number, data: Partial<SocialWork>) =>
      apiClient.put<{ data: SocialWork }>(`/commission/social-work/${id}`, data).then((r) => r.data.data),

    resolve: (id: number, data: { resolution: string }) =>
      apiClient.post<{ data: SocialWork }>(`/commission/social-work/${id}/resolve`, data).then((r) => r.data.data),
  },
};
