import type { ApiResponse } from '@/types/api';

export interface BurndownPoint {
  date: string;
  idealRemaining: number;
  actualRemaining: number;
}

export interface BurndownReport {
  sprintId?: string;
  sprintName?: string;
  sprintStatus?: string;
  startDate?: string;
  endDate?: string;
  totalStoryPoints?: number;
  points: BurndownPoint[];
  message?: string;
}

export interface VelocitySprint {
  sprintId: string;
  sprintName: string;
  sprintStatus: string;
  committed: number;
  completed: number;
}

export interface VelocityReport {
  averageCompleted: number;
  sprints: VelocitySprint[];
}

export interface CumulativeFlowPoint {
  date: string;
  todo: number;
  inProgress: number;
  done: number;
}

export interface CreatedVsResolvedPoint {
  date: string;
  created: number;
  resolved: number;
}

export interface ProjectReportsData {
  burndown: BurndownReport;
  velocity: VelocityReport;
  cumulativeFlow: { points: CumulativeFlowPoint[] };
  createdVsResolved: {
    resolutionRate: number;
    totalCreated: number;
    totalResolved: number;
    points: CreatedVsResolvedPoint[];
  };
}

export type { ProjectReportsData as ProjectReports };
