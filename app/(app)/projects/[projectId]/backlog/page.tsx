'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueApi } from '@/lib/api/issue';
import { sprintApi } from '@/lib/api/sprint';
import { projectApi } from '@/lib/api/project';
import { IssueFilterBar } from '@/components/issue/IssueFilterBar';
import { SprintCard } from '@/components/backlog/SprintCard';
import { BacklogSection } from '@/components/backlog/BacklogSection';
import { CreateIssueModal } from '@/components/issue/CreateIssueModal';
import { IssueDetailModal } from '@/components/issue/IssueDetailModal';
import { EditSprintModal } from '@/components/sprint/EditSprintModal';
import { StartSprintModal } from '@/components/sprint/StartSprintModal';
import { MoveWorkItemsModal } from '@/components/sprint/MoveWorkItemsModal';
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

  // Modals state
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [startingSprint, setStartingSprint] = useState<Sprint | null>(null);
  const [targetSprintId, setTargetSprintId] = useState<string | undefined>(undefined);

  // Collapsed sections state
  const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({});
  const [backlogCollapsed, setBacklogCollapsed] = useState(false);

  // Drag and Drop state
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{
    issue: Issue;
    sourceSprintId?: string;
    sourceSprintName: string;
    targetSprintId?: string;
    targetSprintName: string;
    isTargetActive?: boolean;
  } | null>(null);

  useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  // Auto-scroll when dragging near viewport top or bottom edges
  useEffect(() => {
    if (!draggedIssue) return;

    let animId: number | null = null;
    let scrollSpeed = 0;
    const edgeThreshold = 150; // Trigger distance in px from viewport edge

    const scrollContainer = (delta: number) => {
      try {
        window.scrollBy(0, delta);
      } catch {
        window.scrollBy({ top: delta, behavior: 'auto' });
      }
      if (document.documentElement) {
        document.documentElement.scrollTop += delta;
      }
      if (document.body) {
        document.body.scrollTop += delta;
      }
      const appContent = document.querySelector('.app-content');
      if (appContent) appContent.scrollTop += delta;
      const appMain = document.querySelector('.app-main');
      if (appMain) appMain.scrollTop += delta;
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      const y = e.clientY;
      const height = window.innerHeight;

      if (y < edgeThreshold) {
        // Near top edge -> smooth scroll up
        const intensity = (edgeThreshold - Math.max(0, y)) / edgeThreshold;
        scrollSpeed = -Math.max(5, Math.round(intensity * 28));
      } else if (y > height - edgeThreshold) {
        // Near bottom edge -> smooth scroll down
        const intensity = (Math.min(height, y) - (height - edgeThreshold)) / edgeThreshold;
        scrollSpeed = Math.max(5, Math.round(intensity * 28));
      } else {
        scrollSpeed = 0;
      }
    };

    const scrollLoop = () => {
      if (scrollSpeed !== 0) {
        scrollContainer(scrollSpeed);
      }
      animId = requestAnimationFrame(scrollLoop);
    };

    animId = requestAnimationFrame(scrollLoop);
    window.addEventListener('dragover', handleDragOver, { capture: true });
    document.addEventListener('dragover', handleDragOver, { capture: true });

    const handleDragEnd = () => {
      scrollSpeed = 0;
      setDraggedIssue(null);
      setDragOverTarget(null);
    };

    window.addEventListener('dragend', handleDragEnd, { capture: true });
    window.addEventListener('drop', handleDragEnd, { capture: true });
    document.addEventListener('dragend', handleDragEnd, { capture: true });
    document.addEventListener('drop', handleDragEnd, { capture: true });

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('dragover', handleDragOver, { capture: true });
      document.removeEventListener('dragover', handleDragOver, { capture: true });
      window.removeEventListener('dragend', handleDragEnd, { capture: true });
      window.removeEventListener('drop', handleDragEnd, { capture: true });
      document.removeEventListener('dragend', handleDragEnd, { capture: true });
      document.removeEventListener('drop', handleDragEnd, { capture: true });
    };
  }, [draggedIssue]);

  const projectId = resolvedParams?.projectId ?? '';

  // Data Queries
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
  const createSprintMutation = useMutation({
    mutationFn: async () => {
      let maxNum = 0;
      sprints.forEach((s: Sprint) => {
        const match = s.name.match(/(?:sprint\s*)(\d+)/i) || s.name.match(/(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      });
      const nextNum = maxNum > 0 ? maxNum + 1 : sprints.length + 1;
      const key = project?.projectKey || (project as any)?.key || '';
      const prefix = key ? `${key} Sprint` : 'Sprint';
      const sprintName = `${prefix} ${nextNum}`;

      return sprintApi.create(projectId, { name: sprintName });
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] });
      toast.success(`Created ${res.data?.name || 'Sprint'}!`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create sprint');
    },
  });

  const completeSprintMutation = useMutation({
    mutationFn: (sprintId: string) => sprintApi.complete(sprintId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      qc.invalidateQueries({ queryKey: ['board', projectId] });
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

  const moveIssueMutation = useMutation({
    mutationFn: ({
      issueId,
      targetSprintId,
    }: {
      issueId: string;
      issueKey?: string;
      sourceSprintId?: string;
      targetSprintId?: string;
      targetSprintName?: string;
    }) => issueApi.updateSprint(issueId, targetSprintId ?? null),
    onMutate: async ({ issueId, targetSprintId }) => {
      await qc.cancelQueries({ queryKey: ['issues', projectId] });
      const previousIssues = qc.getQueryData<any>(['issues', projectId, filters]);

      if (previousIssues && Array.isArray(previousIssues.data)) {
        qc.setQueryData(['issues', projectId, filters], {
          ...previousIssues,
          data: previousIssues.data.map((issue: Issue) =>
            issue.id === issueId
              ? { ...issue, sprintId: targetSprintId || undefined }
              : issue
          ),
        });
      }

      return { previousIssues };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previousIssues) {
        qc.setQueryData(['issues', projectId, filters], context.previousIssues);
      }
      toast.error(err?.response?.data?.message || 'Failed to move work item');
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      qc.invalidateQueries({ queryKey: ['sprints', projectId] });
      qc.invalidateQueries({ queryKey: ['board', projectId] });
      if (variables.issueKey && variables.targetSprintName) {
        toast.success(`Moved ${variables.issueKey} to ${variables.targetSprintName}`);
      }
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
        const sprintIssues = allIssues.filter((i: Issue) => i.sprintId === sprint.id);

        return (
          <SprintCard
            key={sprint.id}
            sprint={sprint}
            sprintIssues={sprintIssues}
            isCollapsed={Boolean(collapsedSprints[sprint.id])}
            onToggleCollapse={() => toggleSprint(sprint.id)}
            isDragOver={dragOverTarget === sprint.id}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragOverTarget !== sprint.id) setDragOverTarget(sprint.id);
            }}
            onDragLeave={(e) => {
              if (dragOverTarget === sprint.id && !e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverTarget(null);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverTarget(null);
              const issueId = e.dataTransfer.getData('text/plain') || draggedIssue?.id;
              const issue = draggedIssue || allIssues.find((i) => i.id === issueId);
              if (!issue) return;
              if (issue.sprintId === sprint.id) return;

              let sourceSprintName = 'Backlog';
              if (issue.sprintId) {
                const found = sprints.find((s: Sprint) => s.id === issue.sprintId);
                if (found) sourceSprintName = found.name;
              }

              setPendingMove({
                issue,
                sourceSprintId: issue.sprintId,
                sourceSprintName,
                targetSprintId: sprint.id,
                targetSprintName: sprint.name,
                isTargetActive: sprint.status === 'ACTIVE',
              });
              setDraggedIssue(null);
            }}
            draggedIssueId={draggedIssue?.id}
            onIssueDragStart={(e, issue) => {
              setDraggedIssue(issue);
              e.dataTransfer.setData('text/plain', issue.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onIssueDragEnd={() => {
              setDraggedIssue(null);
              setDragOverTarget(null);
            }}
            onSelectIssue={(id) => setSelectedIssueId(id)}
            onStartSprint={(s) => setStartingSprint(s)}
            onCompleteSprint={(id) => completeSprintMutation.mutate(id)}
            isCompletingSprint={completeSprintMutation.isPending}
            onEditSprint={(s) => setEditingSprint(s)}
            onDeleteSprint={(s) => {
              if (confirm(`Are you sure you want to delete ${s.name}? Issues will return to the backlog.`)) {
                deleteSprintMutation.mutate(s.id);
              }
            }}
            onCreateIssueInSprint={(sprintId) => {
              setTargetSprintId(sprintId);
              setCreateIssueOpen(true);
            }}
          />
        );
      })}

      {/* Backlog Section */}
      <BacklogSection
        issues={backlogIssues}
        isCollapsed={backlogCollapsed}
        onToggleCollapse={() => setBacklogCollapsed(!backlogCollapsed)}
        isDragOver={dragOverTarget === 'BACKLOG'}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          if (dragOverTarget !== 'BACKLOG') setDragOverTarget('BACKLOG');
        }}
        onDragLeave={(e) => {
          if (dragOverTarget === 'BACKLOG' && !e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverTarget(null);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverTarget(null);
          const issueId = e.dataTransfer.getData('text/plain') || draggedIssue?.id;
          const issue = draggedIssue || allIssues.find((i) => i.id === issueId);
          if (!issue) return;
          if (!issue.sprintId) return;

          let sourceSprintName = 'Sprint';
          const found = sprints.find((s: Sprint) => s.id === issue.sprintId);
          if (found) sourceSprintName = found.name;

          setPendingMove({
            issue,
            sourceSprintId: issue.sprintId,
            sourceSprintName,
            targetSprintId: undefined,
            targetSprintName: 'Backlog',
            isTargetActive: false,
          });
          setDraggedIssue(null);
        }}
        draggedIssueId={draggedIssue?.id}
        onIssueDragStart={(e, issue) => {
          setDraggedIssue(issue);
          e.dataTransfer.setData('text/plain', issue.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onIssueDragEnd={() => {
          setDraggedIssue(null);
          setDragOverTarget(null);
        }}
        onSelectIssue={(id) => setSelectedIssueId(id)}
        onCreateSprint={() => createSprintMutation.mutate()}
        isCreatingSprint={createSprintMutation.isPending}
        onCreateIssue={() => {
          setTargetSprintId(undefined);
          setCreateIssueOpen(true);
        }}
        loadingIssues={loadingIssues}
        hasSprintsAbove={displaySprints.length > 0}
      />

      {/* Modals */}
      <CreateIssueModal
        open={createIssueOpen}
        onClose={() => setCreateIssueOpen(false)}
        projectId={projectId}
        initialSprintId={targetSprintId}
      />

      <EditSprintModal
        open={Boolean(editingSprint)}
        onClose={() => setEditingSprint(null)}
        projectId={projectId}
        sprint={editingSprint}
      />

      <StartSprintModal
        open={Boolean(startingSprint)}
        onClose={() => setStartingSprint(null)}
        projectId={projectId}
        sprint={startingSprint}
        issuesCount={allIssues.filter((i: Issue) => i.sprintId === startingSprint?.id).length}
        hasActiveSprint={activeSprints.length > 0}
      />

      <IssueDetailModal
        issueId={selectedIssueId}
        projectId={projectId}
        onClose={() => setSelectedIssueId(null)}
        issues={allIssues}
        onNavigateIssue={(id) => setSelectedIssueId(id)}
      />

      <MoveWorkItemsModal
        open={Boolean(pendingMove)}
        issueKey={pendingMove?.issue.key ?? ''}
        sourceSprintName={pendingMove?.sourceSprintName ?? 'Backlog'}
        targetSprintName={pendingMove?.targetSprintName ?? 'Sprint'}
        onClose={() => setPendingMove(null)}
        onConfirm={() => {
          if (pendingMove) {
            const moveData = {
              issueId: pendingMove.issue.id,
              issueKey: pendingMove.issue.key,
              sourceSprintId: pendingMove.sourceSprintId,
              targetSprintId: pendingMove.targetSprintId,
              targetSprintName: pendingMove.targetSprintName,
            };
            setPendingMove(null);
            moveIssueMutation.mutate(moveData);
          }
        }}
        loading={moveIssueMutation.isPending}
      />
    </div>
  );
}
