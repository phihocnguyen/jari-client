import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { OnlineUser } from '@/types/presence';

export const presenceApi = {
  getOnlineUsers: (projectId: string) =>
    apiClient
      .get<ApiResponse<OnlineUser[]>>(`/projects/${projectId}/presence`)
      .then((r) => r.data.data ?? []),

  heartbeat: (projectId: string) =>
    apiClient
      .post<ApiResponse<void>>(`/projects/${projectId}/presence/heartbeat`)
      .then((r) => r.data),

  leave: (projectId: string) =>
    apiClient
      .post<ApiResponse<void>>(`/projects/${projectId}/presence/leave`)
      .then((r) => r.data),
};
