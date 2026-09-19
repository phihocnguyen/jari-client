'use client';

import React, { useState } from 'react';
import { Bookmark, CheckSquare, AlertCircle, Zap, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import type { Issue, IssueType, IssuePriority, IssueStatus } from '@/types/issue';

interface IssueRowProps {
  issue: Issue;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  onDropOnIssue?: (targetIssue: Issue, e: React.DragEvent) => void;
}

export function IssueRow({
  issue,
  onClick,
  draggable = false,
  onDragStart,
  onDragEnd,
  isDragging = false,
  onDropOnIssue,
}: IssueRowProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const getTypeIcon = (type: IssueType) => {
    switch (type) {
      case 'EPIC':
        return <Zap size={15} color="#9333ea" />;
      case 'STORY':
        return <Bookmark size={15} color="#16a34a" fill="#16a34a" />;
      case 'BUG':
        return <AlertCircle size={15} color="#dc2626" />;
      case 'TASK':
      default:
        return <CheckSquare size={15} color="#2563eb" />;
    }
  };

  const getPriorityIcon = (priority: IssuePriority) => {
    switch (priority) {
      case 'HIGHEST':
      case 'HIGH':
        return <ArrowUp size={14} color="#dc2626" />;
      case 'LOW':
      case 'LOWEST':
        return <ArrowDown size={14} color="#2563eb" />;
      case 'MEDIUM':
      default:
        return <Minus size={14} color="#d97706" />;
    }
  };

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case 'DONE':
        return <span className="badge badge-green">Done</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-blue">In Progress</span>;
      case 'IN_REVIEW':
        return <span className="badge badge-purple">In Review</span>;
      case 'TODO':
      default:
        return <span className="badge badge-gray">To Do</span>;
    }
  };

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={(e) => {
        try {
          window.getSelection()?.removeAllRanges();
        } catch {
          // ignore
        }
        if (e.dataTransfer?.setDragImage && e.currentTarget) {
          e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
        }
        onDragStart?.(e);
      }}
      onDragEnd={(e) => {
        setIsDragOver(false);
        onDragEnd?.(e);
      }}
      onDragOver={(e) => {
        if (!onDropOnIssue) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        if (!isDragOver) setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        if (!onDropOnIssue) return;
        e.stopPropagation();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragOver(false);
        }
      }}
      onDrop={(e) => {
        if (!onDropOnIssue) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        onDropOnIssue(issue, e);
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        backgroundColor: isDragOver ? '#F4F8FD' : 'var(--color-surface-white)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderTop: isDragOver ? '2px solid #0052CC' : '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '6px',
        cursor: draggable ? 'grab' : 'pointer',
        opacity: isDragging ? 0.35 : 1,
        transform: isDragOver ? 'scale(1.01)' : isDragging ? 'scale(0.98)' : 'none',
        boxShadow: isDragOver ? '0 4px 12px rgba(0, 82, 204, 0.18)' : 'none',
        transition: 'all 0.15s ease',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isDragOver) {
          e.currentTarget.style.borderColor = 'var(--color-green-accent)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragOver) {
          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {getTypeIcon(issue.type)}
        </div>
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#0052cc',
            fontFamily: 'inherit',
          }}
        >
          {issue.key}
        </span>
        <span
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-primary)',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {issue.title}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {issue.storyPoints !== undefined && issue.storyPoints !== null && (
          <span
            style={{
              padding: '1px 6px',
              backgroundColor: 'rgba(0,0,0,0.06)',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {issue.storyPoints}
          </span>
        )}

        <div title={`Priority: ${issue.priority}`} style={{ display: 'flex', alignItems: 'center' }}>
          {getPriorityIcon(issue.priority)}
        </div>

        <div>{getStatusBadge(issue.status)}</div>

        {issue.assignee ? (
          <Avatar name={issue.assignee.fullName} src={issue.assignee.avatarUrl} size={24} />
        ) : (
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: '1px dashed rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.625rem',
              color: 'var(--color-text-secondary)',
            }}
            title="Unassigned"
          >
            ?
          </div>
        )}
      </div>
    </div>
  );
}
