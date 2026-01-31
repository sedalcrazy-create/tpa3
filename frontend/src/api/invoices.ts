import apiClient from './client';
import type { PaginatedResponse, PaginationParams } from '../types/api';
import type { Invoice, InvoiceItem } from '../types/invoice';

// Re-export the types so consumers can import from a single place
export type { Invoice, InvoiceItem };

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
export const invoicesApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Invoice>>('/invoices', { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<{ data: Invoice }>(`/invoices/${id}`).then((r) => r.data.data),

  create: (data: Partial<Invoice>) =>
    apiClient.post<{ data: Invoice }>('/invoices', data).then((r) => r.data.data),

  update: (id: number, data: Partial<Invoice>) =>
    apiClient.put<{ data: Invoice }>(`/invoices/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete(`/invoices/${id}`),

  calculate: (id: number) =>
    apiClient.post<{ data: Invoice }>(`/invoices/${id}/calculate`).then((r) => r.data.data),

  submit: (id: number) =>
    apiClient.post<{ data: Invoice }>(`/invoices/${id}/submit`).then((r) => r.data.data),
};
