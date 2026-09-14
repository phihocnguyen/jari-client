// ─── Issue Types ──────────────────────────────────────────────────
export type IssueType = 'EPIC' | 'STORY' | 'TASK' | 'BUG' | 'SUBTASK';
export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type IssuePriority = 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LOWEST';

export interface Assignee {
  id: string;
  fullName: string;
  avatarUrl?: string;
}

export interface Issue {
  id: string;
  key: string;
  title: string;
  description?: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  projectId: string;
  sprintId?: string;
  parentId?: string;
  assignee?: Assignee;
  reporter: Assignee;
  storyPoints?: number;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueDetail extends Issue {
  comments: Comment[];
  children: Issue[];
  sprint?: { id: string; name: string };
}

export interface Comment {
  id: string;
  issueId: string;
  author: Assignee;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueHistory {
  id: string;
  issueId: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  changedBy: Assignee;
  changedAt: string;
}

export interface CreateIssueRequest {
  title: string;
  description?: string;
  type: IssueType;
  status?: IssueStatus;
  priority: IssuePriority;
  assigneeId?: string;
  sprintId?: string;
  parentId?: string;
  storyPoints?: number;
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string | null;
  sprintId?: string | null;
  storyPoints?: number;
}

export interface IssueFilter {
  status?: IssueStatus[];
  type?: IssueType[];
  priority?: IssuePriority[];
  assigneeId?: string;
  sprintId?: string;
  keyword?: string;
  query?: string;
  page?: number;
  size?: number;
}
