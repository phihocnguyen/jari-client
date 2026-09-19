import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { AutomationLog, RunAutomationInput } from '@/types/automation';

export const automationApi = {
  listLogs: (issueId: string) =>
    apiClient
      .get<ApiResponse<AutomationLog[]>>(`/issues/${issueId}/automation/logs`)
      .then((r) => r.data.data ?? []),

  runRule: (issueId: string, rule: string) =>
    apiClient
      .post<ApiResponse<AutomationLog>>(`/issues/${issueId}/automation/run`, { rule })
      .then((r) => r.data.data),
};
