'use client';

import React, { useState } from 'react';
import {
  PanelRight,
  Plus,
  Trash2,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react';
import type { Issue, IssueType, IssuePriority, IssueStatus } from '@/types/issue';
import { getStatusBadgeStyle } from '@/utils/issueStatus';
import { renderTypeIcon } from '@/utils/issueType';
import { renderPriorityIcon } from '@/utils/issuePriority';
import { formatDate } from '@/utils/date';
import { getUserInitials } from '@/utils/user';
import { Select } from '@/components/ui/Select';

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
  onAddChild?: (issue: Issue) => void;
  members: ProjectMember[];
  isActiveIssue?: boolean;
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
  onAddChild,
  members,
  isActiveIssue = false,
}: IssueListRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const statusStyle = getStatusBadgeStyle(issue.status);
  const reporterInitials = getUserInitials(issue.reporter?.fullName || issue.reporter?.email);

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
            <span
              title={`Type: ${issue.type}`}
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              {renderTypeIcon(issue.type)}
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

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onAddChild) onAddChild(issue);
                else onOpenDetail(issue.id);
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
              const displayName = m.fullName || m.email || 'Member';
              return {
                value: memberId,
                label: displayName,
                icon: (
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      backgroundColor: '#e0e7ff',
                      color: '#3730a3',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getUserInitials(m.fullName || m.email)}
                  </div>
                ),
              };
            }),
          ]}
          renderTrigger={(selected) => (
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
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getUserInitials(issue.assignee.fullName || issue.assignee.email)}
                </div>
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
                {selected?.label || (issue.assignee ? issue.assignee.fullName || issue.assignee.email : 'Unassigned')}
              </span>
              <ChevronDown size={12} style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }} />
            </div>
          )}
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
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#00875A',
              color: '#ffffff',
              fontSize: '0.6875rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {reporterInitials}
          </div>
          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--color-text-primary)',
              whiteSpace: 'nowrap',
            }}
          >
            {issue.reporter?.fullName || issue.reporter?.email || 'Reporter'}
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
                border: `1px solid ${statusStyle.border}`,
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
          minWidth: 110,
        }}
      >
        {issue.status === 'DONE' ? 'Done' : 'Unresolved'}
      </td>

      {/* 8. Created Column */}
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
