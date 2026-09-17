import apiClient from './client';
import type { ApiResponse } from '@/types/api';
import type { Notification } from '@/types/notification';

// ─── Notification API ─────────────────────────────────────────────
export const notificationApi = {
  list: () =>
    apiClient.get<ApiResponse<Notification[]>>('/notifications').then(r => r.data),

  unreadCount: () =>
    apiClient.get<ApiResponse<number>>('/notifications/unread-count').then(r => r.data),

  markRead: (id: string) =>
    apiClient.put<ApiResponse<Notification>>(`/notifications/${id}/read`).then(r => r.data),

  markAllRead: () =>
    apiClient.put<ApiResponse<null>>('/notifications/read-all').then(r => r.data),
};
