'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { Issue, IssueStatus, IssuePriority, IssueType } from '@/types/issue';
import { IssueListRow } from './IssueListRow';
import { IssueListQuickCreate } from './IssueListQuickCreate';
import { IssueListFooter } from './IssueListFooter';

interface ProjectMember {
  userId: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
}

interface IssueListTableProps {
  issues: Issue[];
  allIssuesCount: number;
  selectedIds: Set<string>;
  selectedIssueId?: string | null;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onOpenDetail: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: IssueStatus) => void;
  onUpdateAssignee: (id: string, assigneeId: string | null) => void;
  onUpdatePriority: (id: string, priority: IssuePriority) => void;
  inlineCreateOpen: boolean;
  inlineCreateParentId?: string | 'ROOT' | null;
  onCloseInlineCreate: () => void;
  onOpenInlineCreate: () => void;
  onSubmitInlineCreate: (data: {
    title: string;
    type: IssueType;
    priority: IssuePriority;
    assigneeId?: string;
  }) => Promise<void>;
  onAddChild?: (issue: Issue) => void;
  members: ProjectMember[];
  isSubmittingCreate: boolean;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function IssueListTable({
  issues,
  allIssuesCount,
  selectedIds,
  selectedIssueId,
  onToggleSelect,
  onToggleSelectAll,
  onOpenDetail,
  onDelete,
  onUpdateStatus,
  onUpdateAssignee,
  onUpdatePriority,
  inlineCreateOpen,
  inlineCreateParentId,
  onCloseInlineCreate,
  onOpenInlineCreate,
  onSubmitInlineCreate,
  onAddChild,
  members,
  isSubmittingCreate,
  onRefresh,
  isRefreshing = false,
}: IssueListTableProps) {
  const isAllSelected = issues.length > 0 && selectedIds.size === issues.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < issues.length;

  return (
    <div
      style={{
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Scrollable Table Area */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#94a3b8 #f1f5f9',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            minWidth: 1000,
          }}
        >
          {/* Table Header */}
          <thead>
            <tr
              style={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                color: 'var(--color-text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                userSelect: 'none',
              }}
            >
              {/* Checkbox */}
              <th
                style={{
                  width: 40,
                  textAlign: 'center',
                  padding: '10px 10px',
                  verticalAlign: 'middle',
                }}
              >
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={onToggleSelectAll}
                  style={{
                    cursor: 'pointer',
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    accentColor: 'var(--color-green-brand)',
                  }}
                />
              </th>

              {/* Work */}
              <th style={{ padding: '10px 12px', minWidth: 320 }}>Work</th>

              {/* Assignee */}
              <th style={{ padding: '10px 12px', minWidth: 150 }}>Assignee</th>

              {/* Reporter */}
              <th style={{ padding: '10px 12px', minWidth: 130 }}>Reporter</th>

              {/* Priority */}
              <th style={{ padding: '10px 12px', minWidth: 110 }}>Priority</th>

              {/* Status */}
              <th style={{ padding: '10px 12px', minWidth: 130 }}>Status</th>

              {/* Resolution */}
              <th style={{ padding: '10px 12px', minWidth: 110 }}>Resolution</th>

              {/* Created */}
              <th style={{ padding: '10px 12px', minWidth: 150 }}>Created</th>

              {/* Update */}
              <th style={{ padding: '10px 12px', minWidth: 150 }}>Update</th>

              {/* Settings Icon */}
              <th style={{ width: 36, padding: '10px 8px', textAlign: 'center' }}>
                <button
                  type="button"
                  title="Configure columns"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    padding: 4,
                    borderRadius: 4,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <SlidersHorizontal size={14} />
                </button>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {issues.length > 0 ? (
              issues.map((issue) => (
                <React.Fragment key={issue.id}>
                  <IssueListRow
                    issue={issue}
                    isSelected={selectedIds.has(issue.id)}
                    onToggleSelect={onToggleSelect}
                    onOpenDetail={onOpenDetail}
                    onDelete={onDelete}
                    onUpdateStatus={onUpdateStatus}
                    onUpdateAssignee={onUpdateAssignee}
                    onUpdatePriority={onUpdatePriority}
                    onAddChild={onAddChild}
                    members={members}
                    isActiveIssue={selectedIssueId === issue.id}
                  />
                  {/* Render Quick Create directly below this parent if matched */}
                  {inlineCreateParentId === issue.id && (
                    <IssueListQuickCreate
                      isOpen={true}
                      onClose={onCloseInlineCreate}
                      onSubmit={onSubmitInlineCreate}
                      members={members}
                      isSubmitting={isSubmittingCreate}
                      isSubtask={true}
                    />
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={10}
                  style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.875rem',
                  }}
                >
                  No issues found in this project. Click <strong>+ Create</strong> below to add one!
                </td>
              </tr>
            )}

            {/* Inline Quick Create Row at the bottom for ROOT */}
            {inlineCreateParentId === 'ROOT' && (
              <IssueListQuickCreate
                isOpen={true}
                onClose={onCloseInlineCreate}
                onSubmit={onSubmitInlineCreate}
                members={members}
                isSubmitting={isSubmittingCreate}
                isSubtask={false}
              />
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Bar */}
      <IssueListFooter
        totalCount={allIssuesCount}
        filteredCount={issues.length}
        onCreateClick={onOpenInlineCreate}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
