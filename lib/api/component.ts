import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { ProjectComponent, CreateComponentInput, UpdateComponentInput } from '@/types/component';

export const componentApi = {
  list: (projectId: string) =>
    apiClient
      .get<ApiResponse<ProjectComponent[]>>(`/projects/${projectId}/components`)
      .then((r) => r.data.data ?? []),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<ProjectComponent>>(`/components/${id}`)
      .then((r) => r.data.data),

  create: (projectId: string, data: CreateComponentInput) =>
    apiClient
      .post<ApiResponse<ProjectComponent>>(`/projects/${projectId}/components`, data)
      .then((r) => r.data.data),

  update: (id: string, data: UpdateComponentInput) =>
    apiClient
      .put<ApiResponse<ProjectComponent>>(`/components/${id}`, data)
      .then((r) => r.data.data),

  delete: (id: string) =>
    apiClient.delete(`/components/${id}`).then((r) => r.data),
};
