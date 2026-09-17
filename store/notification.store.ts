'use client';

import { create } from 'zustand';
import type { Notification } from '@/types/notification';

// ─── Notification Store ───────────────────────────────────────────
interface NotificationState {
  notifications: Notification[];
  unreadCount:   number;

  addNotification:    (n: Notification) => void;
  setNotifications:   (ns: Notification[]) => void;
  markRead:           (id: string) => void;
  markAllRead:        () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount:   0,

  addNotification: (n) =>
    set((s) => {
      // Skip duplicates (e.g. WS reconnect replay)
      if (s.notifications.some(x => x.id === n.id)) return s;
      return {
        notifications: [n, ...s.notifications],
        unreadCount:   s.unreadCount + (n.read ? 0 : 1),
      };
    }),

  setNotifications: (ns) =>
    set({ notifications: ns, unreadCount: ns.filter(n => !n.read).length }),

  markRead: (id) =>
    set((s) => {
      const updated = s.notifications.map(n => n.id === id ? { ...n, read: true } : n);
      return { notifications: updated, unreadCount: updated.filter(n => !n.read).length };
    }),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
      unreadCount:   0,
    })),

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
