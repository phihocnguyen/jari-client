'use client';

import React from 'react';
import type { Issue, IssueLabel, IssuePriority, IssueStatus, Release } from '@/types/issue';
import type { ProjectComponent } from '@/types/component';
import {
  type ProjectMember,
  TaskStatusActions,
  TaskFieldsDetails,
  TaskDevelopmentSection,
  TaskAutomationSection,
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
  onOpenAiAssistant: () => void;
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
  onOpenAiAssistant,
}: TaskDetailsSidebarProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top action row (status pill, automations, improve story AI) */}
      <TaskStatusActions
        status={issue.status}
        viewMode={viewMode}
        onUpdateStatus={onUpdateStatus}
        onOpenAiAssistant={onOpenAiAssistant}
      />

      {/* Details fields accordion (assignee, parent, sprint, priority, labels, dates, team, release, components, sp, reporter) */}
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

      {/* Development accordion (commits, branches, pull requests) */}
      <TaskDevelopmentSection issueId={issue.id} />

      {/* Automation accordion (audit logs and rule triggers) */}
      <TaskAutomationSection issueId={issue.id} />

      {/* Metadata footer (created, updated, configure) */}
      <TaskMetadataFooter createdAt={issue.createdAt} updatedAt={issue.updatedAt} />
    </div>
  );
}
