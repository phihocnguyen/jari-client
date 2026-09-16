'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-react';
import { issueApi } from '@/lib/api/issue';
import { sprintApi } from '@/lib/api/sprint';
import { projectApi } from '@/lib/api/project';
import { IssueFilterBar } from '@/components/issue/IssueFilterBar';
import { IssueRow } from '@/components/issue/IssueRow';
import { CreateIssueModal } from '@/components/issue/CreateIssueModal';
import { IssueDetailModal } from '@/components/issue/IssueDetailModal';
import { CreateSprintModal } from '@/components/sprint/CreateSprintModal';
import { EditSprintModal } from '@/components/sprint/EditSprintModal';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import type { Issue, IssueFilter } from '@/types/issue';
import type { Sprint } from '@/types/sprint';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

function StatusPillGroup({ issues }: { issues: Issue[] }) {
  let todo = 0;
  let inProgress = 0;
  let done = 0;

  issues.forEach((i) => {
    const s = (i.statusCategory || i.status || '').toUpperCase();
    if (s.includes('DONE') || s.includes('RESOLVED') || s.includes('CLOSED')) {
      done++;
    } else if (s.includes('PROGRESS') || s.includes('REVIEW') || s.includes('DOING')) {
      inProgress++;
    } else {
      todo++;
    }
  });

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span
        title={`${todo} To Do`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 20,
          height: 20,
          padding: '0 6px',
          borderRadius: 10,
          backgroundColor: '#DFE1E6',
          color: '#42526E',
          fontSize: '0.72rem',
          fontWeight: 700,
        }}
      >
        {todo}
      </span>
      <span
        title={`${inProgress} In Progress`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 20,
          height: 20,
          padding: '0 6px',
          borderRadius: 10,
          backgroundColor: '#DEEBFF',
          color: '#0052CC',
          fontSize: '0.72rem',
          fontWeight: 700,
        }}
      >
        {inProgress}
      </span>
      <span
        title={`${done} Done`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 20,
          height: 20,
          padding: '0 6px',
          borderRadius: 10,
          backgroundColor: '#E3FCEF',
          color: '#006644',
          fontSize: '0.72rem',
          fontWeight: 700,
        }}
      >
        {done}
      </span>
    </div>
  );
}

function formatSprintDates(start?: string, end?: string) {
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

export default function BacklogPage({ params }: PageProps) {
  const qc = useQueryClient();
  const [resolvedParams, setResolvedParams] = useState<{ projectId: string } | null>(null);
  const [filters, setFilters] = useState<IssueFilter>({});
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [createSprintOpen, setCreateSprintOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [activeSprintMenuId, setActiveSprintMenuId] = useState<string | null>(null);
  const [targetSprintId, setTargetSprintId] = useState<string | undefined>(undefined);

  const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({});
  const [backlogCollapsed, setBacklogCollapsed] = useState(false);

  useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveSprintMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const projectId = resolvedParams?.projectId ?? '';

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? projectApi.get(projectId).then((r) => r.data) : null),
    enabled: Boolean(projectId),
  });

  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => (projectId ? sprintApi.list(projectId).then((r) => r.data) : []),
    enabled: Boolean(projectId),
  });

  const { data: issuesPage, isLoading: loadingIssues } = useQuery({
    queryKey: ['issues', projectId, filters],
    queryFn: () => (projectId ? issueApi.list(projectId, filters) : null),
    enabled: Boolean(projectId),
  });

  const allIssues: Issue[] = issuesPage?.data ?? [];

  // Mutations
  const startSprintMutation = useMutation({
    mutationFn: (sprintId: string) => sprintApi.start(sprintId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] });
      toast.success('Sprint started successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to start sprint');
    },
  });

  const completeSprintMutation = useMutation({
    mutationFn: (sprintId: string) => sprintApi.complete(sprintId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Sprint completed successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to complete sprint');
    },
  });

  const deleteSprintMutation = useMutation({
    mutationFn: (sprintId: string) => sprintApi.delete(sprintId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Sprint deleted successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete sprint');
    },
  });

  if (!projectId) return null;

  const toggleSprint = (sprintId: string) => {
    setCollapsedSprints((prev) => ({ ...prev, [sprintId]: !prev[sprintId] }));
  };

  const activeSprints = sprints.filter((s: Sprint) => s.status === 'ACTIVE');
  const plannedSprints = sprints.filter(
    (s: Sprint) => s.status === 'PLANNING' || s.status === 'PLANNED'
  );
  const displaySprints = [...activeSprints, ...plannedSprints];
  const backlogIssues = allIssues.filter((i: Issue) => !i.sprintId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Top Filter Bar (Jira Backlog Style) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <IssueFilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Sprints Section */}
      {displaySprints.map((sprint: Sprint) => {
        const isCollapsed = collapsedSprints[sprint.id];
        const sprintIssues = allIssues.filter((i: Issue) => i.sprintId === sprint.id);
        const dateRangeStr = formatSprintDates(sprint.startDate, sprint.endDate);

        return (
          <div
            key={sprint.id}
            style={{
              backgroundColor: 'var(--color-surface-white)',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.08)',
              overflow: 'visible',
            }}
          >
            {/* Sprint Header Row */}
            <div
              style={{
                padding: '10px 16px',
                backgroundColor: sprint.status === 'ACTIVE' ? 'rgba(0, 98, 65, 0.03)' : '#F7F8F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: isCollapsed ? 'none' : '1px solid rgba(0,0,0,0.06)',
                borderRadius: isCollapsed ? '8px' : '8px 8px 0 0',
                userSelect: 'none',
              }}
            >
              {/* Left side: Checkbox, Chevron, Name, Dates, Work item count */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, minWidth: 0 }}
                onClick={() => toggleSprint(sprint.id)}
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
                  {sprint.name}
                </span>

                {dateRangeStr && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginLeft: '4px' }}>
                    {dateRangeStr}
                  </span>
                )}

                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                  ({sprintIssues.length} {sprintIssues.length === 1 ? 'work item' : 'work items'})
                </span>
              </div>

              {/* Right side: Status pills, Action button (Start/Complete), More menu */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
                <StatusPillGroup issues={sprintIssues} />

                {sprint.status === 'ACTIVE' ? (
                  <button
                    onClick={() => completeSprintMutation.mutate(sprint.id)}
                    disabled={completeSprintMutation.isPending}
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
                    Complete sprint
                  </button>
                ) : (
                  <button
                    onClick={() => startSprintMutation.mutate(sprint.id)}
                    disabled={startSprintMutation.isPending}
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
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSprintMenuId(activeSprintMenuId === sprint.id ? null : sprint.id);
                    }}
                    style={{
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 4,
                      border: 'none',
                      backgroundColor: activeSprintMenuId === sprint.id ? '#EBECF0' : 'transparent',
                      color: '#42526E',
                      cursor: 'pointer',
                    }}
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {activeSprintMenuId === sprint.id && (
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
                          setActiveSprintMenuId(null);
                          setEditingSprint(sprint);
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
                          setActiveSprintMenuId(null);
                          if (confirm(`Are you sure you want to delete ${sprint.name}? Issues will return to the backlog.`)) {
                            deleteSprintMutation.mutate(sprint.id);
                          }
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
                      onClick={() => setSelectedIssueId(issue.id)}
                    />
                  ))
                ) : (
                  <div
                    style={{
                      border: '1.5px dashed rgba(0,0,0,0.12)',
                      borderRadius: 6,
                      padding: '24px 16px',
                      textAlign: 'center',
                      color: 'var(--color-text-secondary)',
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
                    onClick={() => {
                      setTargetSprintId(sprint.id);
                      setCreateIssueOpen(true);
                    }}
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
      })}

      {/* Backlog Section (Always present below Sprints) */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-white)',
          borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.08)',
          overflow: 'visible',
          marginTop: displaySprints.length > 0 ? '0.5rem' : '0',
        }}
      >
        {/* Backlog Header Row */}
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: '#F7F8F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: backlogCollapsed ? 'none' : '1px solid rgba(0,0,0,0.06)',
            borderRadius: backlogCollapsed ? '8px' : '8px 8px 0 0',
            userSelect: 'none',
          }}
        >
          {/* Left: Checkbox, Chevron, Title, Count */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}
            onClick={() => setBacklogCollapsed(!backlogCollapsed)}
          >
            <input
              type="checkbox"
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: 'pointer', accentColor: 'var(--color-green-brand)', width: 15, height: 15 }}
            />
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
              {backlogCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </div>

            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-text-primary)' }}>
              Backlog
            </span>

            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              ({backlogIssues.length} {backlogIssues.length === 1 ? 'work item' : 'work items'})
            </span>
          </div>

          {/* Right: Status Pills, Create sprint button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
            <StatusPillGroup issues={backlogIssues} />

            <button
              onClick={() => setCreateSprintOpen(true)}
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
              Create sprint
            </button>
          </div>
        </div>

        {/* Backlog Issues Body */}
        {!backlogCollapsed && (
          <div style={{ padding: '8px 12px' }}>
            {loadingIssues ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                Loading backlog issues...
              </div>
            ) : backlogIssues.length > 0 ? (
              backlogIssues.map((issue: Issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  onClick={() => setSelectedIssueId(issue.id)}
                />
              ))
            ) : (
              <div
                style={{
                  border: '1.5px dashed rgba(0,0,0,0.15)',
                  borderRadius: 6,
                  padding: '24px 16px',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
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
                onClick={() => {
                  setTargetSprintId(undefined);
                  setCreateIssueOpen(true);
                }}
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

      {/* Modals */}
      <CreateIssueModal
        open={createIssueOpen}
        onClose={() => setCreateIssueOpen(false)}
        projectId={projectId}
        initialSprintId={targetSprintId}
      />

      <CreateSprintModal
        open={createSprintOpen}
        onClose={() => setCreateSprintOpen(false)}
        projectId={projectId}
      />

      <EditSprintModal
        open={Boolean(editingSprint)}
        onClose={() => setEditingSprint(null)}
        projectId={projectId}
        sprint={editingSprint}
      />

      <IssueDetailModal
        issueId={selectedIssueId}
        projectId={projectId}
        onClose={() => setSelectedIssueId(null)}
        issues={allIssues}
        onNavigateIssue={(id) => setSelectedIssueId(id)}
      />
    </div>
  );
}
