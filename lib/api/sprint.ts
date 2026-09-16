import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { Sprint, BoardResponse, CreateSprintRequest, UpdateSprintRequest } from '@/types/sprint';

// ─── Sprint API ───────────────────────────────────────────────────
export const sprintApi = {
  list: (projectId: string) =>
    apiClient.get<ApiResponse<Sprint[]>>(`/projects/${projectId}/sprints`).then(r => r.data),

  create: (projectId: string, data: CreateSprintRequest) =>
    apiClient.post<ApiResponse<Sprint>>(`/projects/${projectId}/sprints`, data).then(r => r.data),

  update: (sprintId: string, data: UpdateSprintRequest) =>
    apiClient.put<ApiResponse<Sprint>>(`/sprints/${sprintId}`, data).then(r => r.data),

  start: (sprintId: string) =>
    apiClient.post<ApiResponse<Sprint>>(`/sprints/${sprintId}/start`).then(r => r.data),

  complete: (sprintId: string, moveToSprintId?: string) =>
    apiClient.post<ApiResponse<Sprint>>(`/sprints/${sprintId}/complete`, { moveToSprintId }).then(r => r.data),

  delete: (sprintId: string) =>
    apiClient.delete(`/sprints/${sprintId}`).then(r => r.data),

  addIssue: (sprintId: string, issueId: string) =>
    apiClient.post(`/sprints/${sprintId}/issues`, { issueId }),

  removeIssue: (sprintId: string, issueId: string) =>
    apiClient.delete(`/sprints/${sprintId}/issues/${issueId}`),

  reorderIssue: (sprintId: string, issueId: string, position: string) =>
    apiClient.patch(`/sprints/${sprintId}/issues/${issueId}/position`, { position }),

  // Board
  getBoard: (projectId: string) =>
    apiClient.get<ApiResponse<BoardResponse>>(`/projects/${projectId}/board`).then(r => r.data),
};
