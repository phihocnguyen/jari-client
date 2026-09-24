import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { ProjectReportsData } from '@/types/report';

export const reportApi = {
  get: (projectId: string, params?: { sprintId?: string; days?: number; velocitySprints?: number }) =>
    apiClient
      .get<ApiResponse<ProjectReportsData>>(`/projects/${projectId}/reports`, { params })
      .then((r) => (r.data?.data ?? r.data) as ProjectReportsData),
};
