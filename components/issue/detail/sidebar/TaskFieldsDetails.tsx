'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Select } from '@/components/ui/Select';
import { toast } from '@/components/ui/Toast';
import { renderPriorityIcon } from '@/utils/issue-priority';
import type { Issue, IssueLabel, IssuePriority, Release } from '@/types/issue';
import type { ProjectComponent } from '@/types/component';
import type { ProjectMember } from './sidebarUtils';
import { IssueDateInput } from './IssueDateInput';
import { ParentSelector } from './ParentSelector';
import { LabelsSelector } from './LabelsSelector';
import { ComponentsSelector } from './ComponentsSelector';
import { ReleaseSelector } from './ReleaseSelector';

interface TaskFieldsDetailsProps {
  issue: Issue;
  members: ProjectMember[];
  issues?: Issue[];
  projectLabels?: IssueLabel[];
  projectReleases?: Release[];
  projectComponents?: ProjectComponent[];
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

export function TaskFieldsDetails({
  issue,
  members,
  issues = [],
  projectLabels = [],
  projectReleases = [],
  projectComponents = [],
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
}: TaskFieldsDetailsProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(true);

  return (
    <div
      style={{
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 8,
        backgroundColor: '#ffffff',
      }}
    >
      {/* Accordion Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: '#ffffff',
          borderBottom: detailsExpanded ? '1px solid rgba(0,0,0,0.06)' : 'none',
          cursor: 'pointer',
        }}
        onClick={() => setDetailsExpanded(!detailsExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: '0.84rem' }}>
          {detailsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span>Details</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toast.info('Configure fields');
          }}
          style={{ background: 'none', border: 'none', color: '#626f86', cursor: 'pointer', padding: 2 }}
        >
          <Settings size={15} />
        </button>
      </div>

      {/* Accordion Fields */}
      {detailsExpanded && (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Assignee */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
            <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>Assignee</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <select
                value={issue.assignee?.id || ''}
                onChange={(e) => onUpdateAssignee(e.target.value || null)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#172b4d',
                  fontWeight: 500,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  outline: 'none',
                  padding: '2px 4px',
                  borderRadius: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.fullName}
                  </option>
                ))}
              </select>

              {/* "Assign to me" quick link */}
              {members.length > 0 && issue.assignee?.id !== members[0].userId && (
                <button
                  type="button"
                  onClick={() => onUpdateAssignee(members[0].userId)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0c66e4',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  Assign to me
                </button>
              )}
            </div>
          </div>

          {/* Parent */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
            <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>Parent</span>
            <ParentSelector issue={issue} issues={issues} onUpdateParent={onUpdateParent} />
          </div>

          {/* Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
            <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>Priority</span>
            <Select<IssuePriority>
              value={issue.priority}
              onChange={(pr) => onUpdatePriority(pr)}
              minWidth={140}
              options={(
                ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'] as IssuePriority[]
              ).map((pr) => ({
                value: pr,
                label:
                  pr === 'HIGHEST'
                    ? 'Highest'
                    : pr === 'HIGH'
                    ? 'High'
                    : pr === 'MEDIUM'
                    ? 'Medium'
                    : pr === 'LOW'
                    ? 'Low'
                    : 'Lowest',
                icon: renderPriorityIcon(pr),
              }))}
              renderTrigger={(selected) => (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '2px 6px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'background-color 0.12s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {renderPriorityIcon(issue.priority)}
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#172b4d' }}>
                    {selected?.label ||
                      (issue.priority === 'HIGHEST'
                        ? 'Highest'
                        : issue.priority === 'HIGH'
                        ? 'High'
                        : issue.priority === 'MEDIUM'
                        ? 'Medium'
                        : issue.priority === 'LOW'
                        ? 'Low'
                        : 'Lowest')}
                  </span>
                  <ChevronDown size={12} style={{ color: '#626f86' }} />
                </div>
              )}
            />
          </div>

          {/* Components (thay thế vị trí của Labels để nổi bật và dễ nhìn hơn) */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'start' }}>
            <span style={{ color: '#626f86', fontSize: '0.8125rem', paddingTop: 2 }}>Components</span>
            <ComponentsSelector
              selectedComponents={issue.components}
              projectComponents={projectComponents}
              onSetComponents={onSetComponents}
            />
          </div>

          {/* Start Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
            <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>Start date</span>
            <IssueDateInput value={issue.startDate} onChange={(iso) => onUpdateStartDate(iso)} />
          </div>

          {/* Due Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
            <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>Due date</span>
            <IssueDateInput value={issue.dueDate} onChange={(iso) => onUpdateDueDate(iso)} />
          </div>

          {/* Team */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
            <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>Team</span>
            <span
              style={{ color: '#626f86', fontSize: '0.8125rem', cursor: 'pointer', padding: '2px 4px' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Add team
            </span>
          </div>

          {/* Fix Versions */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
            <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>Fix versions</span>
            <ReleaseSelector
              releaseId={issue.releaseId}
              releaseName={issue.releaseName}
              projectReleases={projectReleases}
              onSetRelease={onSetRelease}
              onCreateRelease={onCreateRelease}
            />
          </div>

          {/* Labels (chuyển xuống mục phụ) */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'start' }}>
            <span style={{ color: '#626f86', fontSize: '0.8125rem', paddingTop: 2 }}>Labels</span>
            <LabelsSelector
              labels={issue.labels}
              projectLabels={projectLabels}
              onSetLabels={onSetLabels}
              onCreateLabel={onCreateLabel}
            />
          </div>

          {/* Story Points */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
            <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>Story points</span>
            <input
              key={`sp-${issue.id}-${issue.storyPoints ?? ''}`}
              type="number"
              min={0}
              max={100}
              defaultValue={issue.storyPoints ?? ''}
              onBlur={(e) => {
                const val = e.target.value ? Number(e.target.value) : undefined;
                if (val !== issue.storyPoints) {
                  onUpdateStoryPoints(val);
                }
              }}
              style={{
                width: 60,
                padding: '2px 6px',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 4,
                fontSize: '0.8125rem',
              }}
            />
          </div>

          {/* Reporter */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
            <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>Reporter</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Avatar name={issue.reporter?.fullName || 'hoc ng'} size={20} />
              <span style={{ fontSize: '0.8125rem', color: '#172b4d' }}>
                {issue.reporter?.fullName || 'hoc ng'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
