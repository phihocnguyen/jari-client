import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { IssueDevelopment, CreateDevelopmentInput } from '@/types/development';

export const developmentApi = {
  list: (issueId: string) =>
    apiClient
      .get<ApiResponse<IssueDevelopment[]>>(`/issues/${issueId}/developments`)
      .then((r) => r.data.data ?? []),

  create: (issueId: string, data: CreateDevelopmentInput) =>
    apiClient
      .post<ApiResponse<IssueDevelopment>>(`/issues/${issueId}/developments`, data)
      .then((r) => r.data.data),

  delete: (id: string) =>
    apiClient.delete(`/developments/${id}`).then((r) => r.data),
};
