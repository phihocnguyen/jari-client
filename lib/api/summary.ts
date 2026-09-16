import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { ProjectSummaryData } from '@/types/summary';

export const summaryApi = {
  get: (projectId: string) =>
    apiClient
      .get<ApiResponse<ProjectSummaryData>>(`/projects/${projectId}/summary`)
      .then((r) => (r.data?.data ?? r.data) as ProjectSummaryData),
};