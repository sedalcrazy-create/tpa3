import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<{ data: LoginResponse }>('/auth/login', data).then((r) => r.data.data),

  logout: () => apiClient.post('/auth/logout'),

  me: () => apiClient.get<{ data: AuthUser }>('/auth/me').then((r) => r.data.data),

  changePassword: (data: { current_password: string; new_password: string; new_password_confirmation: string }) =>
    apiClient.post('/auth/change-password', data),
};
