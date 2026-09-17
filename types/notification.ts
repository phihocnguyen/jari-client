// ─── Notification Types ───────────────────────────────────────────
export type NotificationType =
  | 'ISSUE_ASSIGNED'
  | 'ISSUE_UPDATED'
  | 'ISSUE_COMMENTED'
  | 'ISSUE_DUE_SOON'
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
  workspaceId?: string | null;
  workspaceName?: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}
