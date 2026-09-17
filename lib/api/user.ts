import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/auth';

export const userApi = {
  getProfile: () =>
    apiClient.get<ApiResponse<User>>('/users/me').then(r => r.data),

  search: (query: string) =>
    apiClient.get<ApiResponse<User[]>>('/users/search', { params: { q: query } }).then(r => r.data),
};
