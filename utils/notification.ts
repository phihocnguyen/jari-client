import type { NotificationType } from '@/types/notification';

// ─── Notification Display Helpers ─────────────────────────────────
const NOTIFICATION_TITLES: Record<NotificationType, string> = {
  ISSUE_ASSIGNED:   'Issue assigned to you',
  ISSUE_UPDATED:    'Issue updated',
  ISSUE_COMMENTED:  'New comment',
  ISSUE_DUE_SOON:   'Deadline approaching',
  SPRINT_STARTED:   'Sprint started',
  SPRINT_COMPLETED: 'Sprint completed',
  MEMBER_INVITED:   'Added to a workspace or project',
};

export function notificationTitle(type?: string | null): string {
  if (type && type in NOTIFICATION_TITLES) {
    return NOTIFICATION_TITLES[type as NotificationType];
  }
  return 'New notification';
}
