'use client';

import React, { useState } from 'react';
import {
  PanelRight,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  User as UserIcon,
  Calendar,
} from 'lucide-react';
import type { Issue, IssueType, IssuePriority, IssueStatus } from '@/types/issue';
import { getStatusBadgeStyle } from '@/utils/issue-status';
import { renderTypeIcon } from '@/utils/issue-type';
import { renderPriorityIcon } from '@/utils/issue-priority';
import { formatDate } from '@/utils/date';
import { getUserInitials, getUserDisplayName } from '@/utils/user';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';

interface ProjectMember {
  userId: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
}

interface IssueListRowProps {
  issue: Issue;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: IssueStatus) => void;
  onUpdateAssignee: (id: string, assigneeId: string | null) => void;
  onUpdatePriority: (id: string, priority: IssuePriority) => void;
  onUpdateDueDate?: (id: string, dueDate: string | null) => void;
  onAddChild?: (issue: Issue) => void;
  members: ProjectMember[];
  isActiveIssue?: boolean;
  isSubtask?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function IssueListRow({
  issue,
  isSelected,
  onToggleSelect,
  onOpenDetail,
  onDelete,
  onUpdateStatus,
  onUpdateAssignee,
  onUpdatePriority,
  onUpdateDueDate,
  onAddChild,
  members,
  isActiveIssue = false,
  isSubtask = false,
  hasChildren = false,
  isExpanded = true,
  onToggleExpand,
}: IssueListRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const statusStyle = getStatusBadgeStyle(issue.status);
  const reporterInitials = getUserInitials(getUserDisplayName(issue.reporter, 'Học Nguyễn'));

  const isRowHighlighted = isSelected || isHovered;

  const currentAssigneeId = issue.assignee
    ? issue.assignee.id || (issue.assignee as any).userId || issue.assigneeId || ''
    : '';

  return (
    <tr
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isActiveIssue
          ? '#e9f2ff'
          : isRowHighlighted
            ? 'rgba(12, 102, 228, 0.05)'
            : 'var(--color-surface-white)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        transition: 'background-color 0.12s ease',
        fontSize: '0.84rem',
      }}
    >
      {/* 1. Checkbox Column */}
      <td
        style={{
          width: 40,
          textAlign: 'center',
          padding: '8px 10px',
          verticalAlign: 'middle',
        }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(issue.id)}
          style={{
            cursor: 'pointer',
            width: 16,
            height: 16,
            borderRadius: 3,
            accentColor: 'var(--color-green-brand)',
          }}
        />
      </td>

      {/* 2. Work Column */}
      <td
        style={{
          padding: '8px 12px',
          verticalAlign: 'middle',
          minWidth: 320,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minWidth: 0,
              flex: 1,
            }}
          >
            {/* Indentation for subtask or Chevron toggle for parent */}
            {isSubtask ? (
              <span style={{ width: 28, flexShrink: 0 }} />
            ) : hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand?.();
                }}
                title={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px',
                  borderRadius: 3,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#626f86',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </button>
            ) : (
              <span style={{ width: 19, flexShrink: 0 }} />
            )}

            <span
              title={`Type: ${isSubtask ? 'SUBTASK' : issue.type}`}
              style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
            >
              {renderTypeIcon(isSubtask ? 'SUBTASK' : issue.type)}
            </span>

            <button
              type="button"
              onClick={() => onOpenDetail(issue.id)}
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#0c66e4',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              {issue.key}
            </button>

            <span
              title={issue.title}
              onClick={() => onOpenDetail(issue.id)}
              style={{
                color: 'var(--color-text-primary)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: 'pointer',
              }}
            >
              {issue.title}
            </span>
          </div>

          {/* Hover Action Icons (Side peek + quick subtask) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.15s ease',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => onOpenDetail(issue.id)}
              title="Open detail panel"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px',
                borderRadius: 4,
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)';
                e.currentTarget.style.color = '#0c66e4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <PanelRight size={14} />
            </button>

            {!isSubtask && onAddChild && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild(issue);
                }}
                title="Add child issue"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)';
                  e.currentTarget.style.color = '#0c66e4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                <Plus size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete issue ${issue.key}: "${issue.title}"?`)) {
                  onDelete(issue.id);
                }
              }}
              title="Delete issue"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px',
                borderRadius: 4,
                cursor: 'pointer',
                color: 'var(--color-red)',
                display: 'inline-flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </td>

      {/* 3. Assignee Column */}
      <td
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '8px 12px',
          verticalAlign: 'middle',
          minWidth: 150,
        }}
      >
        <Select
          value={currentAssigneeId}
          onChange={(val) => onUpdateAssignee(issue.id, val ? val : null)}
          minWidth={170}
          options={[
            {
              value: '',
              label: 'Unassigned',
              icon: (
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: '#f1f2f4',
                    color: '#626f86',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <UserIcon size={12} />
                </div>
              ),
            },
            ...members.map((m) => {
              const memberId = m.userId || (m as any).id;
              const displayName = getUserDisplayName(m, 'Học Nguyễn');
              return {
                value: memberId,
                label: displayName,
                icon: <Avatar name={displayName} size={22} />,
              };
            }),
          ]}
          renderTrigger={(selected) => {
            const assigneeName = issue.assignee ? getUserDisplayName(issue.assignee, 'Học Nguyễn') : 'Unassigned';
            return (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 6px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'background-color 0.12s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {issue.assignee ? (
                  <Avatar name={assigneeName} size={24} />
                ) : (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: '#f1f2f4',
                      color: '#626f86',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <UserIcon size={14} />
                  </div>
                )}

                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: issue.assignee ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    fontWeight: 400,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selected?.label || assigneeName}
                </span>
                <ChevronDown size={12} style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }} />
              </div>
            );
          }}
        />
      </td>

      {/* 4. Reporter Column */}
      <td
        style={{
          padding: '8px 12px',
          verticalAlign: 'middle',
          minWidth: 130,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar name={getUserDisplayName(issue.reporter, 'Học Nguyễn')} size={24} />
          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--color-text-primary)',
              whiteSpace: 'nowrap',
            }}
          >
            {getUserDisplayName(issue.reporter, 'Học Nguyễn')}
          </span>
        </div>
      </td>

      {/* 5. Priority Column */}
      <td
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '8px 12px',
          verticalAlign: 'middle',
          minWidth: 110,
        }}
      >
        <Select<IssuePriority>
          value={issue.priority}
          onChange={(pr) => onUpdatePriority(issue.id, pr)}
          minWidth={140}
          options={(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'] as IssuePriority[]).map((pr) => ({
            value: pr,
            label: pr.charAt(0) + pr.slice(1).toLowerCase(),
            icon: renderPriorityIcon(pr),
          }))}
          renderTrigger={() => (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'background-color 0.12s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {renderPriorityIcon(issue.priority)}
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: issue.priority === 'HIGH' || issue.priority === 'HIGHEST' ? 600 : 400,
                  color:
                    issue.priority === 'HIGH' || issue.priority === 'HIGHEST'
                      ? '#dc2626'
                      : 'var(--color-text-primary)',
                }}
              >
                {issue.priority.charAt(0) + issue.priority.slice(1).toLowerCase()}
              </span>
              <ChevronDown size={12} style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }} />
            </div>
          )}
        />
      </td>

      {/* 6. Status Column (Jira Badge Pill) */}
      <td
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '8px 12px',
          verticalAlign: 'middle',
          minWidth: 130,
        }}
      >
        <Select<IssueStatus>
          value={issue.status}
          onChange={(st) => onUpdateStatus(issue.id, st)}
          minWidth={150}
          options={(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as IssueStatus[]).map((st) => ({
            value: st,
            label: getStatusBadgeStyle(st).label,
            badgeStyle: getStatusBadgeStyle(st),
          }))}
          renderTrigger={() => (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 8px',
                backgroundColor: statusStyle.bg,
                color: statusStyle.color,
                border: 'none',
                borderRadius: 4,
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <span>{statusStyle.label}</span>
              <ChevronDown size={12} />
            </div>
          )}
        />
      </td>

      {/* 7. Resolution Column */}
      <td
        style={{
          padding: '8px 12px',
          verticalAlign: 'middle',
          color: issue.status === 'DONE' ? '#006644' : 'var(--color-text-secondary)',
          fontSize: '0.8125rem',
          minWidth: 100,
        }}
      >
        {issue.status === 'DONE' ? 'Done' : 'Unresolved'}
      </td>

      {/* 8. Due Date Column */}
      <td
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '8px 12px',
          verticalAlign: 'middle',
          minWidth: 120,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 6px',
            borderRadius: 4,
            transition: 'background-color 0.12s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Calendar size={13} color="var(--color-text-secondary)" />
          <input
            type="date"
            value={issue.dueDate ? issue.dueDate.split('T')[0] : ''}
            onChange={(e) => onUpdateDueDate?.(issue.id, e.target.value || null)}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '0.8125rem',
              color: issue.dueDate ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: 0,
              outline: 'none',
              maxWidth: 115,
            }}
            title={issue.dueDate ? `Due date: ${formatDate(issue.dueDate)}` : 'Set due date'}
          />
        </div>
      </td>

      {/* 9. Created Column */}
      <td
        style={{
          padding: '8px 12px',
          verticalAlign: 'middle',
          color: 'var(--color-text-secondary)',
          fontSize: '0.8125rem',
          whiteSpace: 'nowrap',
          minWidth: 150,
        }}
      >
        {formatDate(issue.createdAt)}
      </td>

      {/* 9. Updated Column */}
      <td
        style={{
          padding: '8px 12px',
          verticalAlign: 'middle',
          color: 'var(--color-text-secondary)',
          fontSize: '0.8125rem',
          whiteSpace: 'nowrap',
          minWidth: 150,
        }}
      >
        {formatDate(issue.updatedAt || issue.createdAt)}
      </td>

      {/* 10. Column settings empty placeholder for alignment */}
      <td style={{ width: 36, padding: '8px 4px', textAlign: 'center' }} />
    </tr>
  );
}
