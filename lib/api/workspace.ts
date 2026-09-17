import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type {
  Workspace,
  WorkspaceMember,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  UpdateMemberProjectsRequest,
} from '@/types/workspace';
import type { Project } from '@/types/project';

// ─── Workspace API ────────────────────────────────────────────────
export const workspaceApi = {
  list: () =>
    apiClient.get<ApiResponse<Workspace[]>>('/workspaces').then(r => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Workspace>>(`/workspaces/${id}`).then(r => r.data),

  create: (data: CreateWorkspaceRequest) =>
    apiClient.post<ApiResponse<Workspace>>('/workspaces', data).then(r => r.data),

  update: (id: string, data: UpdateWorkspaceRequest) =>
    apiClient.put<ApiResponse<Workspace>>(`/workspaces/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete(`/workspaces/${id}`),

  // Projects
  listProjects: (id: string) =>
    apiClient.get<ApiResponse<Project[]>>(`/workspaces/${id}/projects`).then(r => r.data),

  // Members
  listMembers: (id: string) =>
    apiClient.get<ApiResponse<WorkspaceMember[]>>(`/workspaces/${id}/members`).then(r => r.data),

  inviteMember: (id: string, data: InviteMemberRequest) =>
    apiClient.post<ApiResponse<WorkspaceMember>>(`/workspaces/${id}/members`, data).then(r => r.data),

  updateMemberRole: (workspaceId: string, userId: string, data: UpdateMemberRoleRequest) =>
    apiClient.put<ApiResponse<WorkspaceMember>>(`/workspaces/${workspaceId}/members/${userId}/role`, data).then(r => r.data),

  updateMemberProjects: (workspaceId: string, userId: string, data: UpdateMemberProjectsRequest) =>
    apiClient.put<ApiResponse<WorkspaceMember>>(`/workspaces/${workspaceId}/members/${userId}/projects`, data).then(r => r.data),

  removeMember: (workspaceId: string, userId: string) =>
    apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`),
};
