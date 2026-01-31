import apiClient from './client';

export interface DashboardStats {
  total_employees: number;
  total_insured: number;
  total_claims: number;
  total_invoices: number;
  claims_by_status: { status: string; count: number }[];
  claims_by_type: { type: string; count: number }[];
  top_centers: { name: string; count: number }[];
  monthly_trend: { month: string; claims: number; amount: number }[];
}

export const reportsApi = {
  dashboard: () =>
    apiClient.get<{ data: DashboardStats }>('/reports/dashboard').then((r) => r.data.data),

  claims: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/claims', { params }).then((r) => r.data),

  financial: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/financial', { params }).then((r) => r.data),

  exportClaims: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/claims/export', { params, responseType: 'blob' }).then((r) => r.data),

  exportFinancial: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/financial/export', { params, responseType: 'blob' }).then((r) => r.data),
};
