// ─── Notification Types ───────────────────────────────────────────
export type NotificationType =
  | 'ISSUE_ASSIGNED'
  | 'ISSUE_UPDATED'
  | 'ISSUE_COMMENTED'
  | 'SPRINT_STARTED'
  | 'SPRINT_COMPLETED'
  | 'MEMBER_INVITED';

export interface Notification {
  id: string;
  type: NotificationType;
  targetUserId: string;
  issueId?: string;
  issueKey?: string;
  message: string;
  read: boolean;
  createdAt: string;
}
