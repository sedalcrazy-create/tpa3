import apiClient from './client';
import type { PaginatedResponse, PaginationParams } from '../types/api';

export interface ImportHistory {
  id: number;
  file_name: string;
  file_path: string;
  total_rows: number;
  success_count: number;
  error_count: number;
  insert_count: number;
  update_count: number;
  skip_count: number;
  status: string;
  import_mode?: string;
  selected_fields?: string[];
  imported_by?: number;
  imported_by_name?: string;
  started_at?: string;
  completed_at?: string;
  error_log?: string;
  created_at: string;
}

export interface ImportPreview {
  summary: {
    id: number;
    file_name: string;
    total_rows: number;
    insert_count: number;
    update_count: number;
    skip_count: number;
    error_count: number;
    status: string;
  };
  inserts: ImportTempRecord[];
  updates: ImportTempRecord[];
  errors: ImportTempRecord[];
}

export interface ImportTempRecord {
  id: number;
  row_number: number;
  personnel_code?: string;
  national_code?: string;
  first_name?: string;
  last_name?: string;
  action?: string;
  diff_data?: Record<string, { old: string; new: string }>;
  raw_data?: Record<string, unknown>;
  error_message?: string;
  matched_employee_id?: number;
}

export interface ImportApplyResult {
  insert_count: number;
  update_count: number;
  error_count: number;
  total_processed: number;
}

export const employeeImportApi = {
  // Legacy import
  list: (params?: PaginationParams) =>
    apiClient.get('/employees/import/history', { params }).then((r) => {
      const paginator = r.data?.data || {};
      return {
        data: Array.isArray(paginator.data) ? paginator.data : [],
        meta: {
          current_page: paginator.current_page || 1,
          last_page: paginator.last_page || 1,
          per_page: paginator.per_page || 20,
          total: paginator.total || 0,
          from: paginator.from || 0,
          to: paginator.to || 0,
        },
      } as PaginatedResponse<ImportHistory>;
    }),

  upload: (formData: FormData) =>
    apiClient.post<{ data: ImportHistory }>('/employees/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data),

  get: (id: number) =>
    apiClient.get<{ data: ImportHistory }>(`/employees/import/history/${id}`).then((r) => r.data.data),

  downloadTemplate: () =>
    apiClient.get('/employees/import/template', { responseType: 'blob' }).then((r) => r.data),

  // Staged import flow
  stage: (formData: FormData) =>
    apiClient.post<{ data: ImportHistory }>('/employees/import/stage', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 600000,
    }).then((r) => r.data.data),

  preview: (importId: number) =>
    apiClient.get<{ data: ImportPreview }>(`/employees/import/${importId}/preview`).then((r) => r.data.data),

  apply: (importId: number, importMode: string, selectedFields?: string[]) =>
    apiClient.post<{ data: ImportApplyResult }>(`/employees/import/${importId}/apply`, {
      import_mode: importMode,
      selected_fields: selectedFields,
    }, { timeout: 600000 }).then((r) => r.data.data),
};
