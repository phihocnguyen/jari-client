'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Settings,
  Calendar,
  Zap,
  Sparkles,
  Check,
  ChevronsUp,
  ArrowUp,
  ArrowDown,
  ChevronsDown,
  Minus,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { toast } from '@/components/ui/Toast';
import { Select } from '@/components/ui/Select';
import { renderPriorityIcon } from '@/utils/issuePriority';
import { getStatusBadgeStyle } from '@/utils/issueStatus';
import type { Issue, IssuePriority, IssueStatus } from '@/types/issue';

interface ProjectMember {
  userId: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
}

interface TaskDetailsSidebarProps {
  issue: Issue;
  members: ProjectMember[];
  viewMode: 'modal' | 'right-bar';
  onUpdateStatus: (status: IssueStatus) => void;
  onUpdatePriority: (priority: IssuePriority) => void;
  onUpdateAssignee: (assigneeId: string | null) => void;
  onUpdateStoryPoints: (points?: number) => void;
  onUpdateDueDate: (dueDate?: string) => void;
  onOpenAiAssistant: () => void;
}

export function TaskDetailsSidebar({
  issue,
  members,
  viewMode,
  onUpdateStatus,
  onUpdatePriority,
  onUpdateAssignee,
  onUpdateStoryPoints,
  onUpdateDueDate,
  onOpenAiAssistant,
}: TaskDetailsSidebarProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [devExpanded, setDevExpanded] = useState(false);
  const [autoExpanded, setAutoExpanded] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusMenuOpen(false);
      }
    }
    if (statusMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [statusMenuOpen]);

  const getPriorityIcon = (priority?: IssuePriority) => {
    switch (priority) {
      case 'HIGHEST':
        return <ChevronsUp size={15} color="#dc2626" />;
      case 'HIGH':
        return <ArrowUp size={15} color="#dc2626" />;
      case 'LOW':
        return <ArrowDown size={15} color="#2563eb" />;
      case 'LOWEST':
        return <ChevronsDown size={15} color="#2563eb" />;
      case 'MEDIUM':
      default:
        return <Minus size={15} color="#d97706" />;
    }
  };

  const statusBadge = getStatusBadgeStyle(issue.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* In Modal Mode: Top status and Improve Task button row */}
      {viewMode === 'modal' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Status Dropdown Pill */}
          <div ref={statusRef} style={{ position: 'relative', flex: 1 }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setStatusMenuOpen((v) => !v);
              }}
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 12px',
                backgroundColor: statusBadge.bg,
                color: statusBadge.color,
                border: 'none',
                borderRadius: 4,
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              <span>{statusBadge.label}</span>
              <ChevronDown size={14} />
            </button>

            {statusMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '100%',
                  marginTop: 4,
                  backgroundColor: '#ffffff',
                  borderRadius: 6,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
                  border: '1px solid rgba(0,0,0,0.12)',
                  padding: '4px 0',
                  zIndex: 100,
                }}
              >
                {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as IssueStatus[]).map((st) => {
                  const badge = getStatusBadgeStyle(st);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        onUpdateStatus(st);
                        setStatusMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        color: badge.color,
                        fontWeight: issue.status === st ? 600 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <span>{badge.label}</span>
                      {issue.status === st && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lightning Bolt */}
          <button
            type="button"
            title="Automations"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              backgroundColor: '#f1f2f4',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              color: '#44546f',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#091e4224')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
          >
            <Zap size={14} />
          </button>

          {/* Improve Task */}
          <button
            type="button"
            onClick={onOpenAiAssistant}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              backgroundColor: '#f1f2f4',
              color: '#172b4d',
              border: 'none',
              borderRadius: 4,
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#091e4224')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
          >
            <Sparkles size={14} color="#0c66e4" />
            <span>Improve Task</span>
          </button>
        </div>
      )}

      {/* ─── Details Accordion Card ───────────────────────────── */}
      <div
        style={{
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 8,
          backgroundColor: '#ffffff',
          overflow: 'hidden',
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
              <span style={{ color: '#0c66e4', fontSize: '0.8125rem', cursor: 'pointer' }}>
                {issue.parentId ? issue.parentId : 'Add parent'}
              </span>
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
                      {selected?.label || (issue.priority === 'HIGHEST' ? 'Highest' : issue.priority === 'HIGH' ? 'High' : issue.priority === 'MEDIUM' ? 'Medium' : issue.priority === 'LOW' ? 'Low' : 'Lowest')}
                    </span>
                    <ChevronDown size={12} style={{ color: '#626f86' }} />
                  </div>
                )}
              />
            </div>

            {/* Labels */}
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
              <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>Labels</span>
              <span style={{ color: '#626f86', fontSize: '0.8125rem', cursor: 'pointer' }}>
                Add labels
              </span>
            </div>

            {/* Due Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
              <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>Due date</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} color="#626f86" />
                <input
                  type="date"
                  defaultValue={issue.dueDate ? issue.dueDate.substring(0, 10) : ''}
                  onChange={(e) => onUpdateDueDate(e.target.value || undefined)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#172b4d',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Team */}
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
              <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>Team</span>
              <span style={{ color: '#626f86', fontSize: '0.8125rem', cursor: 'pointer' }}>
                Add team
              </span>
            </div>

            {/* Start Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
              <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>Start date</span>
              <span style={{ color: '#626f86', fontSize: '0.8125rem', cursor: 'pointer' }}>
                Add date
              </span>
            </div>

            {/* Fix Versions */}
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
              <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>Fix versions</span>
              <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>None</span>
            </div>

            {/* Story Points */}
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center' }}>
              <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>Story points</span>
              <input
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

      {/* ─── Collapsible: Development ─────────────────────────── */}
      <div
        style={{
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 8,
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 14px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.84rem',
          }}
          onClick={() => setDevExpanded(!devExpanded)}
        >
          {devExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span>Development</span>
        </div>
        {devExpanded && (
          <div style={{ padding: '8px 14px 12px', fontSize: '0.8125rem', color: '#626f86' }}>
            No branches, commits, or pull requests connected yet.
          </div>
        )}
      </div>

      {/* ─── Collapsible: Automation ──────────────────────────── */}
      <div
        style={{
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 8,
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.84rem',
          }}
          onClick={() => setAutoExpanded(!autoExpanded)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {autoExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span>Automation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#626f86', fontSize: '0.75rem', fontWeight: 500 }}>
            <Zap size={12} />
            <span>Rule executions</span>
          </div>
        </div>
        {autoExpanded && (
          <div style={{ padding: '8px 14px 12px', fontSize: '0.8125rem', color: '#626f86' }}>
            No automation rules have executed for this task recently.
          </div>
        )}
      </div>

      {/* ─── Metadata Footer ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 2px',
          fontSize: '0.75rem',
          color: '#626f86',
        }}
      >
        <div>
          <div>Created 2 hours ago</div>
          <div>Updated 2 hours ago</div>
        </div>
        <button
          type="button"
          onClick={() => toast.info('Configure task layout')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: '#626f86',
            cursor: 'pointer',
            fontSize: '0.75rem',
          }}
        >
          <Settings size={13} />
          <span>Configure</span>
        </button>
      </div>
    </div>
  );
}
