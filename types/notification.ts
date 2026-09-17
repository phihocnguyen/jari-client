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
  issueId?: string | null;
  issueKey?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}
