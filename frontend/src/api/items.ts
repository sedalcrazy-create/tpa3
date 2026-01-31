import apiClient from './client';
import type { PaginatedResponse, PaginationParams } from '../types/api';
import type { Item, ItemPrice } from '../types/item';

export const itemsApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Item>>('/items', { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient.get<{ data: Item }>(`/items/${id}`).then((r) => r.data.data),

  create: (data: Partial<Item>) =>
    apiClient.post<{ data: Item }>('/items', data).then((r) => r.data.data),

  update: (id: number, data: Partial<Item>) =>
    apiClient.put<{ data: Item }>(`/items/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete(`/items/${id}`),

  prices: (itemId: number) =>
    apiClient.get<{ data: ItemPrice[] }>(`/items/${itemId}/prices`).then((r) => r.data.data),

  addPrice: (itemId: number, data: Partial<ItemPrice>) =>
    apiClient.post<{ data: ItemPrice }>(`/items/${itemId}/prices`, data).then((r) => r.data.data),

  updatePrice: (itemId: number, priceId: number, data: Partial<ItemPrice>) =>
    apiClient.put<{ data: ItemPrice }>(`/items/${itemId}/prices/${priceId}`, data).then((r) => r.data.data),

  deletePrice: (itemId: number, priceId: number) =>
    apiClient.delete(`/items/${itemId}/prices/${priceId}`),
};
