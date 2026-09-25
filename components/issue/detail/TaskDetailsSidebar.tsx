'use client';

import React from 'react';
import type { Issue, IssueLabel, IssuePriority, IssueStatus, Release } from '@/types/issue';
import type { ProjectComponent } from '@/types/component';
import {
  type ProjectMember,
  TaskStatusActions,
  TaskFieldsDetails,
  TaskDevelopmentSection,
  TaskMetadataFooter,
} from './sidebar';

export type { ProjectMember };

export interface TaskDetailsSidebarProps {
  issue: Issue;
  members: ProjectMember[];
  viewMode: 'modal' | 'right-bar' | 'full-page';
  issues?: Issue[];
  projectLabels?: IssueLabel[];
  projectReleases?: Release[];
  projectComponents?: ProjectComponent[];
  onUpdateStatus: (status: IssueStatus) => void;
  onUpdatePriority: (priority: IssuePriority) => void;
  onUpdateAssignee: (assigneeId: string | null) => void;
  onUpdateStoryPoints: (points?: number) => void;
  onUpdateStartDate: (startDate: string | null) => void;
  onUpdateDueDate: (dueDate: string | null) => void;
  onUpdateParent: (parentId: string | null) => void;
  onSetLabels: (labelIds: string[]) => void;
  onCreateLabel: (name: string) => Promise<IssueLabel>;
  onSetRelease: (releaseId: string | null) => void;
  onCreateRelease: (data: { name: string; description?: string; releaseDate?: string }) => Promise<Release>;
  onSetComponents?: (componentIds: string[]) => void;
}

export function TaskDetailsSidebar({
  issue,
  members,
  viewMode,
  issues = [],
  projectLabels = [],
  projectReleases = [],
  projectComponents = [],
  onUpdateStatus,
  onUpdatePriority,
  onUpdateAssignee,
  onUpdateStoryPoints,
  onUpdateStartDate,
  onUpdateDueDate,
  onUpdateParent,
  onSetLabels,
  onCreateLabel,
  onSetRelease,
  onCreateRelease,
  onSetComponents,
}: TaskDetailsSidebarProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <TaskStatusActions
        status={issue.status}
        viewMode={viewMode}
        onUpdateStatus={onUpdateStatus}
      />

      <TaskFieldsDetails
        issue={issue}
        members={members}
        issues={issues}
        projectLabels={projectLabels}
        projectReleases={projectReleases}
        projectComponents={projectComponents}
        onUpdatePriority={onUpdatePriority}
        onUpdateAssignee={onUpdateAssignee}
        onUpdateStoryPoints={onUpdateStoryPoints}
        onUpdateStartDate={onUpdateStartDate}
        onUpdateDueDate={onUpdateDueDate}
        onUpdateParent={onUpdateParent}
        onSetLabels={onSetLabels}
        onCreateLabel={onCreateLabel}
        onSetRelease={onSetRelease}
        onCreateRelease={onCreateRelease}
        onSetComponents={onSetComponents}
      />

      <TaskDevelopmentSection issueId={issue.id} />

      <TaskMetadataFooter createdAt={issue.createdAt} updatedAt={issue.updatedAt} />
    </div>
  );
}
