// Types for GET /api/v1/projects/{projectId}/summary

export interface SummaryMetrics {
  completedLast7Days: number;
  updatedLast7Days: number;
  createdLast7Days: number;
  dueNext7Days: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface PriorityCount {
  priority: string;
  count: number;
}

export interface TypeCount {
  type: string;
  count: number;
}

export interface MemberWorkload {
  userId: string;
  fullName: string;
  assignedCount: number;
  inProgressCount: number;
  percent: number;
}

export interface ActivityItem {
  actorName: string;
  action: string;
  issueKey: string;
  issueTitle: string;
  occurredAt: string;
}

export interface EpicProgress {
  epicId: string;
  epicKey: string;
  epicTitle: string;
  total: number;
  doneCount: number;
  inProgressCount: number;
  todoCount: number;
  donePercent: number;
  inProgressPercent: number;
  todoPercent: number;
}

export interface ProjectSummaryData {
  metrics: SummaryMetrics;
  statusBreakdown: StatusCount[];
  priorityBreakdown: PriorityCount[];
  typeBreakdown: TypeCount[];
  teamWorkload: MemberWorkload[];
  recentActivity: ActivityItem[];
  epicProgress: EpicProgress[];
}
