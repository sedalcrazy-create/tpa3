import apiClient from './client';
import type { PaginatedResponse, PaginationParams } from '../types/api';
import type { Employee, EmployeeFamily } from '../types/employee';

export const employeesApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Employee>>('/employees', { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<{ data: Employee }>(`/employees/${id}`).then((r) => r.data.data),

  create: (data: FormData) =>
    apiClient.post<{ data: Employee }>('/employees', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data),

  update: (id: number, data: FormData) =>
    apiClient.post<{ data: Employee }>(`/employees/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { _method: 'PUT' },
    }).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete(`/employees/${id}`),

  bulkDelete: (ids: number[]) =>
    apiClient.post('/employees/bulk-delete', { ids }),

  search: (query: string) =>
    apiClient.get<{ data: Employee[] }>('/employees/search', { params: { q: query } }).then((r) => r.data.data),

  // Family
  family: (employeeId: number) =>
    apiClient.get<{ data: EmployeeFamily[] }>(`/employees/${employeeId}/family`).then((r) => r.data.data),

  addFamily: (employeeId: number, data: Partial<EmployeeFamily>) =>
    apiClient.post<{ data: EmployeeFamily }>(`/employees/${employeeId}/family`, data).then((r) => r.data.data),

  updateFamily: (employeeId: number, familyId: number, data: Partial<EmployeeFamily>) =>
    apiClient.put<{ data: EmployeeFamily }>(`/employees/${employeeId}/family/${familyId}`, data).then((r) => r.data.data),

  deleteFamily: (employeeId: number, familyId: number) =>
    apiClient.delete(`/employees/${employeeId}/family/${familyId}`),
};
