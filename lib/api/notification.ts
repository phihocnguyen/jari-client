import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { Notification } from '@/types/notification';

// ─── Notification API ─────────────────────────────────────────────
export const notificationApi = {
  list: (userId?: string) =>
    apiClient
      .get<ApiResponse<Notification[]>>('/notifications', {
        params: userId ? { userId } : undefined,
      })
      .then((r) => r.data),

  unreadCount: (userId?: string) =>
    apiClient
      .get<ApiResponse<number>>('/notifications/unread-count', {
        params: userId ? { userId } : undefined,
      })
      .then((r) => r.data),

  markRead: (id: string, userId?: string) =>
    apiClient
      .put<ApiResponse<Notification>>(`/notifications/${id}/read`, null, {
        params: userId ? { userId } : undefined,
      })
      .then((r) => r.data),

  markAllRead: (userId?: string) =>
    apiClient
      .put<ApiResponse<null>>('/notifications/read-all', null, {
        params: userId ? { userId } : undefined,
      })
      .then((r) => r.data),
};
