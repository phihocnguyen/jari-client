import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { Release } from '@/types/issue';

export interface CreateReleaseData {
  name: string;
  description?: string;
  releaseDate?: string;
}

export const releaseApi = {
  list: (projectId: string) =>
    apiClient.get<ApiResponse<Release[]>>(`/projects/${projectId}/releases`).then((r) => {
      const raw = r.data?.data ?? r.data;
      return (Array.isArray(raw) ? raw : []) as Release[];
    }),

  create: (projectId: string, data: CreateReleaseData) =>
    apiClient
      .post<ApiResponse<Release>>(`/projects/${projectId}/releases`, data)
      .then((r) => r.data.data),
};
