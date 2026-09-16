'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, MoreHorizontal, Edit2, Trash2, Plus } from 'lucide-react';
import { StatusPillGroup } from './StatusPillGroup';
import { IssueRow } from '@/components/issue/IssueRow';
import { Button } from '@/components/ui/Button';
import type { Issue } from '@/types/issue';
import type { Sprint } from '@/types/sprint';

export function formatSprintDates(start?: string, end?: string) {
  if (!start && !end) return '';
  const fmt = (dStr: string) => {
    try {
      const d = new Date(dStr);
      return isNaN(d.getTime())
        ? dStr
        : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return dStr;
    }
  };
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `Starts ${fmt(start)}`;
  return `Ends ${fmt(end!)}`;
}

interface SprintCardProps {
  sprint: Sprint;
  sprintIssues: Issue[];
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
  onStartSprint: (sprint: Sprint) => void;
  onCompleteSprint: (sprintId: string) => void;
  isCompletingSprint?: boolean;
  onEditSprint: (sprint: Sprint) => void;
  onDeleteSprint: (sprint: Sprint) => void;
  onCreateIssueInSprint: (sprintId: string) => void;
  onDropOnIssue?: (targetIssue: Issue) => void;
}

export function SprintCard({
  sprint,
  sprintIssues,
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
  onStartSprint,
  onCompleteSprint,
  isCompletingSprint = false,
  onEditSprint,
  onDeleteSprint,
  onCreateIssueInSprint,
  onDropOnIssue,
}: SprintCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const dateRangeStr = formatSprintDates(sprint.startDate, sprint.endDate);
  const isActive = sprint.status === 'ACTIVE';

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [menuOpen]);

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        backgroundColor: isDragOver ? '#F4F8FD' : '#FFFFFF',
        borderRadius: '6px',
        borderTop: isDragOver
          ? '2px dashed #0052CC'
          : isActive
          ? '1px solid #4C9AFF'
          : '1px solid #DFE1E6',
        borderRight: isDragOver
          ? '2px dashed #0052CC'
          : isActive
          ? '1px solid #4C9AFF'
          : '1px solid #DFE1E6',
        borderBottom: isDragOver
          ? '2px dashed #0052CC'
          : isActive
          ? '1px solid #4C9AFF'
          : '1px solid #DFE1E6',
        borderLeft: isDragOver
          ? '4px solid #0052CC'
          : isActive
          ? '4px solid #0052CC'
          : '1px solid #DFE1E6',
        boxShadow: isDragOver
          ? '0 4px 14px rgba(0, 82, 204, 0.15)'
          : isActive
          ? '0 2px 8px rgba(0, 82, 204, 0.12)'
          : 'none',
        overflow: 'visible',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Sprint Header Row */}
      <div
        style={{
          padding: '10px 16px',
          backgroundColor: isActive ? '#EBF3FB' : '#F1F2F4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isCollapsed ? 'none' : isActive ? '1px solid #B3D4FF' : '1px solid #DFE1E6',
          borderRadius: isCollapsed ? '6px' : '6px 6px 0 0',
          userSelect: 'none',
        }}
      >
        {/* Left side: Checkbox, Chevron, Name, Status Lozenge, Dates, Work item count */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, minWidth: 0 }}
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

          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: isActive ? '#0747A6' : 'var(--color-text-primary)' }}>
            {sprint.name}
          </span>

          {isActive && (
            <span
              style={{
                backgroundColor: '#0052CC',
                color: '#FFFFFF',
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 4,
                letterSpacing: '0.04em',
                display: 'inline-flex',
                alignItems: 'center',
                lineHeight: 1.2,
              }}
            >
              ACTIVE
            </span>
          )}

          {dateRangeStr && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginLeft: '4px' }}>
              {dateRangeStr}
            </span>
          )}

          {sprint.goal && (
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
                fontStyle: 'italic',
                maxWidth: 240,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={sprint.goal}
            >
              • {sprint.goal}
            </span>
          )}

          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            ({sprintIssues.length} {sprintIssues.length === 1 ? 'work item' : 'work items'})
          </span>
        </div>

        {/* Right side: Status pills, Action button (Start/Complete), More menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
          <StatusPillGroup issues={sprintIssues} />

          {isActive ? (
            <button
              onClick={() => onCompleteSprint(sprint.id)}
              disabled={isCompletingSprint}
              style={{
                height: 28,
                padding: '0 12px',
                borderRadius: 4,
                border: '1px solid #0052CC',
                backgroundColor: '#0052CC',
                color: '#FFFFFF',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0747A6';
                e.currentTarget.style.borderColor = '#0747A6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0052CC';
                e.currentTarget.style.borderColor = '#0052CC';
              }}
            >
              Complete sprint
            </button>
          ) : (
            <button
              onClick={() => onStartSprint(sprint)}
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
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EBECF0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              Start sprint
            </button>
          )}

          {/* Dropdown Menu (...) */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              style={{
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                border: 'none',
                backgroundColor: menuOpen ? '#EBECF0' : 'transparent',
                color: '#42526E',
                cursor: 'pointer',
              }}
            >
              <MoreHorizontal size={16} />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 32,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 6,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  padding: '4px 0',
                  zIndex: 100,
                  minWidth: 140,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    color: '#172B4D',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F5F7')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => {
                    setMenuOpen(false);
                    onEditSprint(sprint);
                  }}
                >
                  <Edit2 size={14} />
                  <span>Edit sprint</span>
                </div>

                <div
                  style={{
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    color: '#DE350B',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFEBE6')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteSprint(sprint);
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete sprint</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sprint Issues List Body */}
      {!isCollapsed && (
        <div style={{ padding: '8px 12px' }}>
          {sprintIssues.length > 0 ? (
            sprintIssues.map((issue: Issue) => (
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
              Plan a sprint by dragging issues here or clicking <strong>+ Create</strong> below.
            </div>
          )}

          {/* Inline + Create button below sprint issues */}
          <div style={{ marginTop: '6px' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCreateIssueInSprint(sprint.id)}
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
