// ─── Issue Types ──────────────────────────────────────────────────
export type IssueType = 'EPIC' | 'STORY' | 'TASK' | 'BUG' | 'SUBTASK';
export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type IssuePriority = 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LOWEST';

export interface Assignee {
  id: string;
  fullName: string;
  avatarUrl?: string;
  email?: string;
}

export interface Issue {
  id: string;
  key: string;
  issueKey?: string;
  title: string;
  description?: string;
  type: IssueType;
  issueType?: string;
  status: IssueStatus;
  statusCategory?: string;
  priority: IssuePriority;
  projectId: string;
  sprintId?: string;
  parentId?: string;
  assignee?: Assignee;
  assigneeId?: string;
  assigneeName?: string;
  reporter?: Assignee;
  reporterId?: string;
  reporterName?: string;
  storyPoints?: number;
  startDate?: string;
  dueDate?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  subtext?: string;
  progressPercent?: number;
  extraAssigneeCount?: number;
  labels?: IssueLabel[];
  components?: import('./component').ProjectComponent[];
  releaseId?: string;
  releaseName?: string;
}

export interface IssueLabel {
  id: string;
  name: string;
  color?: string;
}

export interface Release {
  id: string;
  projectId?: string;
  name: string;
  description?: string;
  status?: 'UNRELEASED' | 'RELEASED' | 'ARCHIVED';
  releaseDate?: string;
  createdAt?: string;
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
  issueTypeId?: string;
  statusId?: string;
  priorityId?: string;
  type?: IssueType;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string;
  sprintId?: string;
  parentId?: string;
  storyPoints?: number;
  startDate?: string;
  dueDate?: string;
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  issueTypeId?: string;
  statusId?: string;
  priorityId?: string;
  type?: IssueType;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string | null;
  sprintId?: string | null;
  parentId?: string | null;
  storyPoints?: number;
  startDate?: string;
  dueDate?: string;
}

export interface IssueFilter {
  status?: IssueStatus[];
  type?: IssueType[];
  priority?: IssuePriority[];
  statusId?: string;
  assigneeId?: string;
  issueTypeId?: string;
  priorityId?: string;
  sprintId?: string;
  keyword?: string;
  query?: string;
  page?: number;
  size?: number;
}
