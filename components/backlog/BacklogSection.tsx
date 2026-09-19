'use client';

import React from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { StatusPillGroup } from './StatusPillGroup';
import { IssueRow } from '@/components/issue/IssueRow';
import { SkeletonIssueRow } from '@/components/backlog/BacklogSkeleton';
import { Button } from '@/components/ui/Button';
import type { Issue } from '@/types/issue';

interface BacklogSectionProps {
  issues: Issue[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  draggedIssueId?: string | null;
  onIssueDragStart: (e: React.DragEvent, issue: Issue) => void;
  onIssueDragEnd: () => void;
  onSelectIssue: (issueId: string) => void;
  onCreateSprint: () => void;
  isCreatingSprint?: boolean;
  onCreateIssue: () => void;
  loadingIssues?: boolean;
  hasSprintsAbove?: boolean;
  onDropOnIssue?: (targetIssue: Issue, e: React.DragEvent) => void;
}

export function BacklogSection({
  issues,
  isCollapsed,
  onToggleCollapse,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  draggedIssueId,
  onIssueDragStart,
  onIssueDragEnd,
  onSelectIssue,
  onCreateSprint,
  isCreatingSprint = false,
  onCreateIssue,
  loadingIssues = false,
  hasSprintsAbove = false,
  onDropOnIssue,
}: BacklogSectionProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        backgroundColor: isDragOver ? '#F4F8FD' : '#FFFFFF',
        borderRadius: '6px',
        border: isDragOver ? '2px dashed #0052CC' : '1px solid #DFE1E6',
        boxShadow: isDragOver ? '0 4px 14px rgba(0, 82, 204, 0.15)' : 'none',
        overflow: 'visible',
        marginTop: hasSprintsAbove ? '0.5rem' : '0',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Backlog Header Row */}
      <div
        style={{
          padding: '10px 16px',
          backgroundColor: '#F1F2F4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isCollapsed ? 'none' : '1px solid #DFE1E6',
          borderRadius: isCollapsed ? '6px' : '6px 6px 0 0',
          userSelect: 'none',
        }}
      >
        {/* Left: Checkbox, Chevron, Title, Count */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}
          onClick={onToggleCollapse}
        >
          <input
            type="checkbox"
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: 'pointer', accentColor: 'var(--color-green-brand)', width: 15, height: 15 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </div>

          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-text-primary)' }}>
            Backlog
          </span>

          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            ({issues.length} {issues.length === 1 ? 'work item' : 'work items'})
          </span>
        </div>

        {/* Right: Status Pills, Create sprint button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
          <StatusPillGroup issues={issues} />

          <button
            onClick={onCreateSprint}
            disabled={isCreatingSprint}
            style={{
              height: 28,
              padding: '0 12px',
              borderRadius: 4,
              border: '1px solid #DFE1E6',
              backgroundColor: '#FFFFFF',
              color: '#172B4D',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s',
              opacity: isCreatingSprint ? 0.7 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EBECF0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            {isCreatingSprint ? 'Creating...' : 'Create sprint'}
          </button>
        </div>
      </div>

      {/* Backlog Issues Body */}
      {!isCollapsed && (
        <div style={{ padding: '8px 12px' }}>
          {loadingIssues ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              Loading backlog issues...
            </div>
          ) : issues.length > 0 ? (
            issues.map((issue: Issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                draggable
                isDragging={draggedIssueId === issue.id}
                onDragStart={(e) => onIssueDragStart(e, issue)}
                onDragEnd={onIssueDragEnd}
                onClick={() => onSelectIssue(issue.id)}
                onDropOnIssue={onDropOnIssue}
              />
            ))
          ) : (
            <div
              style={{
                border: '1.5px dashed #C1C7D0',
                borderRadius: 4,
                padding: '24px 16px',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                backgroundColor: '#FAFBFC',
                fontSize: '0.84rem',
                margin: '6px 0',
              }}
            >
              Your backlog is empty.
            </div>
          )}

          {/* Inline + Create button */}
          <div style={{ marginTop: '6px' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateIssue}
              style={{
                color: 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: '0.84rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
              }}
            >
              <Plus size={15} /> Create
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
