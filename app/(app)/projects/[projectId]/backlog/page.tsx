'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Play, CheckCircle, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { issueApi } from '@/lib/api/issue';
import { sprintApi } from '@/lib/api/sprint';
import { projectApi } from '@/lib/api/project';
import { IssueFilterBar } from '@/components/issue/IssueFilterBar';
import { IssueRow } from '@/components/issue/IssueRow';
import { CreateIssueModal } from '@/components/issue/CreateIssueModal';
import { IssueDetailModal } from '@/components/issue/IssueDetailModal';
import { CreateSprintModal } from '@/components/sprint/CreateSprintModal';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import type { Issue, IssueFilter } from '@/types/issue';
import type { Sprint } from '@/types/sprint';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function BacklogPage({ params }: PageProps) {
  const qc = useQueryClient();
  const [resolvedParams, setResolvedParams] = useState<{ projectId: string } | null>(null);
  const [filters, setFilters] = useState<IssueFilter>({});
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [createSprintOpen, setCreateSprintOpen] = useState(false);
  const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({});

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  const projectId = resolvedParams?.projectId ?? '';

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? projectApi.get(projectId).then(r => r.data) : null),
    enabled: Boolean(projectId),
  });

  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => (projectId ? sprintApi.list(projectId).then(r => r.data) : []),
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
      toast.success('Sprint started!');
    },
    onError: () => toast.error('Failed to start sprint'),
  });

  const completeSprintMutation = useMutation({
    mutationFn: (sprintId: string) => sprintApi.complete(sprintId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Sprint completed!');
    },
    onError: () => toast.error('Failed to complete sprint'),
  });

  if (!projectId) return null;

  const toggleSprint = (sprintId: string) => {
    setCollapsedSprints(prev => ({ ...prev, [sprintId]: !prev[sprintId] }));
  };

  const activeSprints = sprints.filter((s: Sprint) => s.status === 'ACTIVE');
  const plannedSprints = sprints.filter((s: Sprint) => s.status === 'PLANNING');
  const backlogIssues = allIssues.filter((i: Issue) => !i.sprintId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Backlog
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="outlined" onClick={() => setCreateSprintOpen(true)}>
            <Plus size={15} /> Create sprint
          </Button>
          <Button onClick={() => setCreateIssueOpen(true)}>
            <Plus size={15} /> Create issue
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <IssueFilterBar filters={filters} onChange={setFilters} />

      {/* Sprints Sections */}
      {[...activeSprints, ...plannedSprints].map((sprint: Sprint) => {
        const isCollapsed = collapsedSprints[sprint.id];
        const sprintIssues = allIssues.filter((i: Issue) => i.sprintId === sprint.id);
        const totalPoints = sprintIssues.reduce((acc: number, curr: Issue) => acc + (curr.storyPoints || 0), 0);

        return (
          <div
            key={sprint.id}
            style={{
              backgroundColor: 'var(--color-surface-white)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid rgba(0,0,0,0.08)',
              marginBottom: '1.25rem',
              overflow: 'hidden',
            }}
          >
            {/* Sprint Header */}
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: sprint.status === 'ACTIVE' ? 'rgba(0, 98, 65, 0.04)' : 'rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: isCollapsed ? 'none' : '1px solid rgba(0,0,0,0.06)',
                cursor: 'pointer',
              }}
              onClick={() => toggleSprint(sprint.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{sprint.name}</span>
                {sprint.status === 'ACTIVE' && (
                  <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>ACTIVE</span>
                )}
                {sprint.goal && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginLeft: '8px' }}>
                    {sprint.goal}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={e => e.stopPropagation()}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                  {sprintIssues.length} issues · {totalPoints} pts
                </span>

                {sprint.status === 'ACTIVE' ? (
                  <Button
                    size="sm"
                    variant="outlined"
                    onClick={() => completeSprintMutation.mutate(sprint.id)}
                    loading={completeSprintMutation.isPending}
                  >
                    <CheckCircle size={14} /> Complete Sprint
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startSprintMutation.mutate(sprint.id)}
                    loading={startSprintMutation.isPending}
                  >
                    <Play size={14} /> Start Sprint
                  </Button>
                )}
              </div>
            </div>

            {/* Sprint Issues List */}
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
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                    No issues in this sprint. Plan work by dragging or creating issues here.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Backlog Section */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-white)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid rgba(0,0,0,0.08)',
          overflow: 'hidden',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="var(--color-green-brand)" />
            <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Backlog</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              ({backlogIssues.length} issues)
            </span>
          </div>

          <Button size="sm" variant="ghost" onClick={() => setCreateIssueOpen(true)}>
            <Plus size={14} /> Create issue
          </Button>
        </div>

        <div style={{ padding: '8px 12px' }}>
          {loadingIssues ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
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
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              Your backlog is empty. Click <strong>+ Create issue</strong> to add work to this project.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateIssueModal
        open={createIssueOpen}
        onClose={() => setCreateIssueOpen(false)}
        projectId={projectId}
      />

      <CreateSprintModal
        open={createSprintOpen}
        onClose={() => setCreateSprintOpen(false)}
        projectId={projectId}
      />

      <IssueDetailModal
        issueId={selectedIssueId}
        projectId={projectId}
        onClose={() => setSelectedIssueId(null)}
      />
    </div>
  );
}
