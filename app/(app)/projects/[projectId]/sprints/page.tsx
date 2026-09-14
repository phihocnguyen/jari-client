'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Play, CheckCircle2, Calendar, Target, Flag } from 'lucide-react';
import { sprintApi } from '@/lib/api/sprint';
import { projectApi } from '@/lib/api/project';
import { CreateSprintModal } from '@/components/sprint/CreateSprintModal';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import type { Sprint } from '@/types/sprint';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function SprintsPage({ params }: PageProps) {
  const qc = useQueryClient();
  const [resolvedParams, setResolvedParams] = useState<{ projectId: string } | null>(null);
  const [createSprintOpen, setCreateSprintOpen] = useState(false);

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  const projectId = resolvedParams?.projectId ?? '';

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? projectApi.get(projectId).then(r => r.data) : null),
    enabled: Boolean(projectId),
  });

  const { data: sprints = [], isLoading } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => (projectId ? sprintApi.list(projectId).then(r => r.data) : []),
    enabled: Boolean(projectId),
  });

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
      toast.success('Sprint completed!');
    },
    onError: () => toast.error('Failed to complete sprint'),
  });

  if (!projectId) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Sprints
        </h1>

        <Button onClick={() => setCreateSprintOpen(true)}>
          <Plus size={16} /> Create Sprint
        </Button>
      </div>

      {/* Sprints List */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading sprints...
        </div>
      ) : sprints.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {sprints.map((sprint: Sprint) => (
            <div
              key={sprint.id}
              className="card"
              style={{
                padding: '1.5rem',
                borderLeft: sprint.status === 'ACTIVE'
                  ? '4px solid var(--color-green-accent)'
                  : sprint.status === 'COMPLETED'
                  ? '4px solid #3B82F6'
                  : '4px solid #EAB308',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{sprint.name}</h2>
                  <span className={`badge ${sprint.status === 'ACTIVE' ? 'badge-green' : sprint.status === 'COMPLETED' ? 'badge-blue' : 'badge-gold'}`}>
                    {sprint.status}
                  </span>
                </div>

                <div>
                  {sprint.status === 'ACTIVE' ? (
                    <Button
                      variant="outlined"
                      onClick={() => completeSprintMutation.mutate(sprint.id)}
                      loading={completeSprintMutation.isPending}
                    >
                      <CheckCircle2 size={16} /> Complete Sprint
                    </Button>
                  ) : sprint.status === 'PLANNING' ? (
                    <Button
                      onClick={() => startSprintMutation.mutate(sprint.id)}
                      loading={startSprintMutation.isPending}
                    >
                      <Play size={16} /> Start Sprint
                    </Button>
                  ) : (
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                      Completed
                    </span>
                  )}
                </div>
              </div>

              {sprint.goal && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                  <Target size={16} color="var(--color-green-brand)" />
                  <span>Goal: {sprint.goal}</span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={15} />
                  <span>
                    {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'Set start date'} - {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'Set end date'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Flag size={15} />
                  <span>{sprint.issueCount ?? 8} issues planned</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Sprints Created Yet</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Create a sprint to organize your backlog tasks into time-boxed iterations.
          </p>
          <Button onClick={() => setCreateSprintOpen(true)}>
            <Plus size={16} /> Create First Sprint
          </Button>
        </div>
      )}

      {/* Modal */}
      <CreateSprintModal
        open={createSprintOpen}
        onClose={() => setCreateSprintOpen(false)}
        projectId={projectId}
      />
    </div>
  );
}
