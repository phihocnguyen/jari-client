'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Bookmark,
  AlertCircle,
  Zap,
  GitFork,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronsUp,
  ChevronsDown,
  PanelRight,
  Plus,
  Trash2,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react';
import type { Issue, IssueType, IssuePriority, IssueStatus } from '@/types/issue';

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
  members: ProjectMember[];
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
  members,
}: IssueListRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);

  // Type Icon renderer
  const renderTypeIcon = (type: IssueType) => {
    switch (type) {
      case 'EPIC':
        return <Zap size={15} color="#9333ea" fill="#9333ea" />;
      case 'STORY':
        return <Bookmark size={15} color="#16a34a" fill="#16a34a" />;
      case 'BUG':
        return <AlertCircle size={15} color="#dc2626" />;
      case 'SUBTASK':
        return <GitFork size={15} color="#0284c7" />;
      case 'TASK':
      default:
        return <CheckSquare size={15} color="#2563eb" />;
    }
  };

  // Priority Icon renderer
  const renderPriorityIcon = (priority: IssuePriority) => {
    switch (priority) {
      case 'HIGHEST':
        return <ChevronsUp size={14} color="#dc2626" />;
      case 'HIGH':
        return <ArrowUp size={14} color="#dc2626" />;
      case 'LOW':
        return <ArrowDown size={14} color="#2563eb" />;
      case 'LOWEST':
        return <ChevronsDown size={14} color="#2563eb" />;
      case 'MEDIUM':
        return <Minus size={14} color="#d97706" />;
      default:
        return null;
    }
  };

  // Status Badge styling according to Jira design
  const getStatusBadgeStyle = (status: IssueStatus) => {
    switch (status) {
      case 'DONE':
        return {
          bg: '#e3fcef',
          color: '#006644',
          border: '#abf5d1',
          label: 'Done',
        };
      case 'IN_PROGRESS':
        return {
          bg: '#deebff',
          color: '#0052cc',
          border: '#b3d4ff',
          label: 'In Progress',
        };
      case 'IN_REVIEW':
        return {
          bg: '#f3e8ff',
          color: '#6b21a8',
          border: '#e9d5ff',
          label: 'In Review',
        };
      case 'TODO':
      default:
        return {
          bg: '#f1f2f4',
          color: '#44546f',
          border: '#dcdfe4',
          label: 'To Do',
        };
    }
  };

  const statusStyle = getStatusBadgeStyle(issue.status);

  // Format dates
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Reporter initials
  const reporterInitials = (issue.reporter?.fullName || 'HN')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isRowHighlighted = isSelected || isHovered;

  return (
    <tr
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setStatusMenuOpen(false);
        setAssigneeMenuOpen(false);
        setPriorityMenuOpen(false);
      }}
      style={{
        backgroundColor: isRowHighlighted
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
              onClick={() => onOpenDetail(issue.id)}
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
        style={{
          padding: '8px 12px',
          verticalAlign: 'middle',
          position: 'relative',
          minWidth: 150,
        }}
      >
        <div
          onClick={() => setAssigneeMenuOpen(!assigneeMenuOpen)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: 4,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)')}
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
              {issue.assignee.fullName.slice(0, 2).toUpperCase()}
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
              color: issue.assignee ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              fontWeight: 400,
              fontSize: '0.8125rem',
              whiteSpace: 'nowrap',
            }}
          >
            {issue.assignee ? issue.assignee.fullName : 'Unassigned'}
          </span>
        </div>

        {/* Assignee Dropdown */}
        {assigneeMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 12,
              zIndex: 50,
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: 160,
              padding: '4px 0',
            }}
          >
            <div
              onClick={() => {
                onUpdateAssignee(issue.id, null);
                setAssigneeMenuOpen(false);
              }}
              style={{
                padding: '6px 12px',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Unassigned
            </div>
            {members.map((m) => (
              <div
                key={m.userId}
                onClick={() => {
                  onUpdateAssignee(issue.id, m.userId);
                  setAssigneeMenuOpen(false);
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {m.fullName.slice(0, 2).toUpperCase()}
                </div>
                <span>{m.fullName}</span>
              </div>
            ))}
          </div>
        )}
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
            {issue.reporter?.fullName || 'hoc ng'}
          </span>
        </div>
      </td>

      {/* 5. Priority Column */}
      <td
        style={{
          padding: '8px 12px',
          verticalAlign: 'middle',
          position: 'relative',
          minWidth: 110,
        }}
      >
        <div
          onClick={() => setPriorityMenuOpen(!priorityMenuOpen)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: 4,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {renderPriorityIcon(issue.priority)}
          <span
            style={{
              fontSize: '0.8125rem',
              color:
                issue.priority === 'HIGH' || issue.priority === 'HIGHEST'
                  ? '#dc2626'
                  : 'var(--color-text-primary)',
              fontWeight:
                issue.priority === 'HIGH' || issue.priority === 'HIGHEST' ? 600 : 400,
            }}
          >
            {issue.priority === 'MEDIUM'
              ? 'Medium'
              : issue.priority === 'HIGH'
              ? 'High'
              : issue.priority === 'HIGHEST'
              ? 'Highest'
              : issue.priority === 'LOW'
              ? 'Low'
              : issue.priority === 'LOWEST'
              ? 'Lowest'
              : 'None'}
          </span>
        </div>

        {priorityMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 12,
              zIndex: 50,
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: 120,
              padding: '4px 0',
            }}
          >
            {(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'] as IssuePriority[]).map((pr) => (
              <div
                key={pr}
                onClick={() => {
                  onUpdatePriority(issue.id, pr);
                  setPriorityMenuOpen(false);
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {renderPriorityIcon(pr)}
                <span>{pr.charAt(0) + pr.slice(1).toLowerCase()}</span>
              </div>
            ))}
          </div>
        )}
      </td>

      {/* 6. Status Column (Jira Pill Dropdown) */}
      <td
        style={{
          padding: '8px 12px',
          verticalAlign: 'middle',
          position: 'relative',
          minWidth: 130,
        }}
      >
        <button
          type="button"
          onClick={() => setStatusMenuOpen(!statusMenuOpen)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '2px 8px',
            backgroundColor: statusStyle.bg,
            color: statusStyle.color,
            border: `1px solid ${statusStyle.border}`,
            borderRadius: 4,
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <span>{statusStyle.label}</span>
          <ChevronDown size={12} />
        </button>

        {statusMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 12,
              zIndex: 50,
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: 130,
              padding: '4px 0',
            }}
          >
            {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as IssueStatus[]).map((st) => {
              const b = getStatusBadgeStyle(st);
              return (
                <div
                  key={st}
                  onClick={() => {
                    onUpdateStatus(issue.id, st);
                    setStatusMenuOpen(false);
                  }}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span
                    style={{
                      padding: '1px 6px',
                      backgroundColor: b.bg,
                      color: b.color,
                      borderRadius: 3,
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                    }}
                  >
                    {b.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
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
