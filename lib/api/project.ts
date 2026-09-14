import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { Project, ProjectMember, CreateProjectRequest, UpdateProjectRequest } from '@/types/project';

// ─── Project API ──────────────────────────────────────────────────
export const projectApi = {
  list: (workspaceId: string) =>
    apiClient.get<ApiResponse<Project[]>>(`/workspaces/${workspaceId}/projects`).then(r => r.data),

  get: (projectId: string) =>
    apiClient.get<ApiResponse<Project>>(`/projects/${projectId}`).then(r => r.data),

  create: (workspaceId: string, data: CreateProjectRequest) =>
    apiClient.post<ApiResponse<Project>>(`/workspaces/${workspaceId}/projects`, data).then(r => r.data),

  update: (projectId: string, data: UpdateProjectRequest) =>
    apiClient.put<ApiResponse<Project>>(`/projects/${projectId}`, data).then(r => r.data),

  delete: (projectId: string) =>
    apiClient.delete(`/projects/${projectId}`),

  // Members
  listMembers: (projectId: string) =>
    apiClient.get<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`).then(r => r.data),
};
