import apiClient from './client';
import type { PaginatedResponse, PaginationParams } from '../types/api';

export interface AuditLog {
  id: number;
  user_id: number;
  user_name?: string;
  action: string;
  auditable_type: string;
  auditable_id: number;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  url?: string;
  method?: string;
  created_at: string;
}

export const auditApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<AuditLog>>('/audit-logs', { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<{ data: AuditLog }>(`/audit-logs/${id}`).then((r) => r.data.data),
};
