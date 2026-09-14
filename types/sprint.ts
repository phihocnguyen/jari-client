// ─── Sprint Types ─────────────────────────────────────────────────
export type SprintStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED';

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  status: SprintStatus;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  issueCount?: number;
}

export interface CreateSprintRequest {
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateSprintRequest {
  name?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}

export interface BoardColumn {
  statusId?: string;
  statusName: string;
  statusCategory?: string;
  issues: import('./issue').Issue[];
}

export interface BoardResponse {
  sprint?: Sprint;
  columns: BoardColumn[];
}
