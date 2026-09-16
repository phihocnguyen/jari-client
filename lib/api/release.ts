import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { Release } from '@/types/issue';

export interface CreateReleaseData {
  name: string;
  description?: string;
  releaseDate?: string;
}

export interface UpdateReleaseData {
  name?: string;
  description?: string;
  releaseDate?: string;
  status?: string;
}

export const releaseApi = {
  list: (projectId: string) =>
    apiClient.get<ApiResponse<Release[]>>(`/projects/${projectId}/releases`).then((r) => {
      const raw = r.data?.data ?? r.data;
      return (Array.isArray(raw) ? raw : []) as Release[];
    }),

  get: (releaseId: string) =>
    apiClient.get<ApiResponse<Release>>(`/releases/${releaseId}`).then((r) => r.data?.data ?? r.data),

  create: (projectId: string, data: CreateReleaseData) =>
    apiClient
      .post<ApiResponse<Release>>(`/projects/${projectId}/releases`, data)
      .then((r) => r.data?.data ?? r.data),

  update: (releaseId: string, data: UpdateReleaseData) =>
    apiClient
      .put<ApiResponse<Release>>(`/releases/${releaseId}`, data)
      .then((r) => r.data?.data ?? r.data),

  delete: (releaseId: string) =>
    apiClient.delete<ApiResponse<void>>(`/releases/${releaseId}`).then((r) => r.data),
};
