import apiClient from './client';
import type { ApiResponse } from '@/types/api';

export interface GithubRepoView {
  id: string;
  githubRepoId: number;
  fullName: string;
  htmlUrl?: string;
  projectId?: string | null;
  projectName?: string | null;
}

export interface GithubInstallationView {
  id: string;
  installationId: number;
  accountLogin: string;
  accountType?: string;
  repos: GithubRepoView[];
}

export const githubApi = {
  getInstallUrl: (workspaceId: string) =>
    apiClient
      .get<ApiResponse<{ url: string }>>(`/workspaces/${workspaceId}/github/install-url`)
      .then((r) => r.data?.data ?? r.data),

  listInstallations: (workspaceId: string) =>
    apiClient
      .get<ApiResponse<GithubInstallationView[]>>(`/workspaces/${workspaceId}/github/installations`)
      .then((r) => {
        const raw = r.data?.data ?? r.data;
        return (Array.isArray(raw) ? raw : []) as GithubInstallationView[];
      }),

  mapRepo: (workspaceId: string, repoId: string, projectId: string | null) =>
    apiClient
      .put<ApiResponse<GithubRepoView>>(`/workspaces/${workspaceId}/github/repos/${repoId}`, {
        projectId,
      })
      .then((r) => r.data?.data ?? r.data),

  disconnect: (workspaceId: string, installationId: string) =>
    apiClient
      .delete(`/workspaces/${workspaceId}/github/installations/${installationId}`)
      .then((r) => r.data),
};
