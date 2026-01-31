import apiClient from './client';
import type { PaginatedResponse, PaginationParams } from '../types/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface PrescriptionItem {
  id?: number;
  item_id: number;
  item_name?: string;
  quantity: number;
  dosage?: string;
  description?: string;
}

export interface Prescription {
  id: number;
  prescription_number: string;
  employee_id: number;
  employee_name?: string;
  doctor_name?: string;
  center_id?: number;
  center_name?: string;
  prescription_date: string;
  diagnosis_code?: string;
  diagnosis_title?: string;
  items?: PrescriptionItem[];
  status: string;
  status_title?: string;
  created_at?: string;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
export const prescriptionsApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Prescription>>('/prescriptions', { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<{ data: Prescription }>(`/prescriptions/${id}`).then((r) => r.data.data),

  create: (data: Partial<Prescription>) =>
    apiClient.post<{ data: Prescription }>('/prescriptions', data).then((r) => r.data.data),

  update: (id: number, data: Partial<Prescription>) =>
    apiClient.put<{ data: Prescription }>(`/prescriptions/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete(`/prescriptions/${id}`),
};
