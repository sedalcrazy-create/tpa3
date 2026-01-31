import apiClient from './client';
import type { PaginatedResponse, PaginationParams } from '../types/api';

export interface Diagnosis {
  id: number;
  code: string;
  title: string;
  title_en: string;
  category: string;
  is_active: boolean;
}

export const diagnosesApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Diagnosis>>('/diagnoses', { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<{ data: Diagnosis }>(`/diagnoses/${id}`).then((r) => r.data.data),
};
