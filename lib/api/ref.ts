import apiClient from './client';
import type { ApiResponse } from '@/types/api';

export interface ReferenceItem {
  id: string;
  name: string;
  description?: string | null;
  extra?: string | null;
}

// ─── Reference Data API ───────────────────────────────────────────
export const refApi = {
  getIssueTypes: () =>
    apiClient.get<ApiResponse<ReferenceItem[]>>('/ref/issue-types').then((r) => r.data),

  getStatuses: () =>
    apiClient.get<ApiResponse<ReferenceItem[]>>('/ref/statuses').then((r) => r.data),

  getPriorities: () =>
    apiClient.get<ApiResponse<ReferenceItem[]>>('/ref/priorities').then((r) => r.data),
};
