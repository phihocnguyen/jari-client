import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { IssueLabel } from '@/types/issue';

export const labelApi = {
  list: (projectId: string) =>
    apiClient.get<ApiResponse<IssueLabel[]>>(`/projects/${projectId}/labels`).then((r) => {
      const raw = r.data?.data ?? r.data;
      return (Array.isArray(raw) ? raw : []) as IssueLabel[];
    }),

  create: (projectId: string, name: string) =>
    apiClient
      .post<ApiResponse<IssueLabel>>(`/projects/${projectId}/labels`, { name })
      .then((r) => r.data.data),
};
