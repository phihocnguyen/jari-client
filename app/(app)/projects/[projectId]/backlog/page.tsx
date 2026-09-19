'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
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
import { BacklogSkeleton } from '@/components/backlog/BacklogSkeleton';
import { toast } from '@/components/ui/Toast';
import type { Issue, IssueFilter } from '@/types/issue';
import type { Sprint } from '@/types/sprint';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function BacklogPage() {
  const qc = useQueryClient();
  const routeParams = useParams();
  const projectId = (routeParams?.projectId as string) ?? '';
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
  const draggedIssueRef = useRef<Issue | null>(null);
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
    };

    window.addEventListener('dragend', handleDragEnd);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('dragover', handleDragOver, { capture: true });
      document.removeEventListener('dragover', handleDragOver, { capture: true });
      window.removeEventListener('dragend', handleDragEnd);
    };
  }, [draggedIssue]);

  // Data Queries
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? projectApi.get(projectId).then((r) => r.data) : null),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 5,
  });

  const { data: sprints = [], isLoading: loadingSprints } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => (projectId ? sprintApi.list(projectId).then((r) => r.data) : []),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 5,
  });

  const hasActiveFilters = Boolean(
    filters &&
    (filters.query || filters.assigneeId || filters.status || filters.type || filters.priority)
  );

  const { data: issuesPage, isLoading: loadingIssues } = useQuery({
    queryKey: hasActiveFilters ? ['issues', projectId, filters] : ['issues', projectId],
    queryFn: () => (projectId ? issueApi.list(projectId, hasActiveFilters ? filters : undefined) : null),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 5,
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

  // Helper to sync all issues caches (with or without active filters)
  const syncIssuesCache = (updater: (list: Issue[]) => Issue[]) => {
    qc.setQueryData(['issues', projectId], (old: any) => {
      if (!old) return old;
      const list: Issue[] = Array.isArray(old) ? old : old.data;
      if (!Array.isArray(list)) return old;
      const updated = updater(list);
      return Array.isArray(old) ? updated : { ...old, data: updated };
    });

    qc.setQueryData(['issues', projectId, filters], (old: any) => {
      if (!old) return old;
      const list: Issue[] = Array.isArray(old) ? old : old.data;
      if (!Array.isArray(list)) return old;
      const updated = updater(list);
      return Array.isArray(old) ? updated : { ...old, data: updated };
    });
  };

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
      const prevBase = qc.getQueryData(['issues', projectId]);
      const prevFiltered = qc.getQueryData(['issues', projectId, filters]);

      // Instant optimistic UI update at 0ms!
      syncIssuesCache((list) =>
        list.map((issue: Issue) =>
          issue.id === issueId
            ? { ...issue, sprintId: targetSprintId || undefined }
            : issue
        )
      );

      return { prevBase, prevFiltered };
    },
    onError: (err: any, _vars, context) => {
      if (context?.prevBase) qc.setQueryData(['issues', projectId], context.prevBase);
      if (context?.prevFiltered) qc.setQueryData(['issues', projectId, filters], context.prevFiltered);
      toast.error(err?.response?.data?.message || 'Failed to move work item');
    },
    onSuccess: (res) => {
      const updated = res?.data;
      if (updated) {
        syncIssuesCache((list) =>
          list.map((issue: Issue) => (issue.id === updated.id ? { ...issue, ...updated } : issue))
        );
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      qc.invalidateQueries({ queryKey: ['sprints', projectId] });
      qc.invalidateQueries({ queryKey: ['board', projectId] });
    },
  });

  if (!projectId) return null;

  const toggleSprint = (sprintId: string) => {
    setCollapsedSprints((prev) => ({ ...prev, [sprintId]: !prev[sprintId] }));
  };

  const handleDropOnIssue = (targetIssue: Issue, e?: React.DragEvent) => {
    let droppedId = e?.dataTransfer?.getData('text/plain');
    if (droppedId && droppedId.includes('\n')) {
      droppedId = droppedId.split('\n')[0].trim();
    }
    const sourceIssue =
      draggedIssueRef.current ||
      draggedIssue ||
      (droppedId ? allIssues.find((i) => i.id === droppedId || i.key === droppedId) : null);

    if (!sourceIssue || sourceIssue.id === targetIssue.id) return;

    const sourceSprintId = sourceIssue.sprintId;
    const targetSprintId = targetIssue.sprintId;

    // Reorder in React Query cache
    const currentList: Issue[] = [...allIssues];
    const sourceIndex = currentList.findIndex((i) => i.id === sourceIssue.id);
    const targetIndex = currentList.findIndex((i) => i.id === targetIssue.id);

    if (sourceIndex === -1 || targetIndex === -1) return;

    // Update sourceIssue's sprintId to targetIssue's sprintId
    const updatedSource = { ...sourceIssue, sprintId: targetSprintId };

    // Move source to target's position
    currentList.splice(sourceIndex, 1);
    currentList.splice(targetIndex, 0, updatedSource);

    // INSTANT OPTIMISTIC UPDATE: Sync across both query caches so UI re-renders at 0ms!
    syncIssuesCache(() => currentList);

    draggedIssueRef.current = null;
    setDraggedIssue(null);
    setDragOverTarget(null);

    // If moved to a different sprint (or to backlog)
    if (sourceSprintId !== targetSprintId) {
      const targetSprint = sprints.find((s: Sprint) => s.id === targetSprintId);
      const targetSprintName = targetSprint ? targetSprint.name : 'Backlog';

      moveIssueMutation.mutate({
        issueId: sourceIssue.id,
        issueKey: sourceIssue.key,
        sourceSprintId,
        targetSprintId,
        targetSprintName,
      });
    } else if (targetSprintId) {
      // Reordered within the SAME sprint -> persist order to backend silently!
      const sprintIssueIds = currentList
        .filter((i) => i.sprintId === targetSprintId)
        .map((i) => i.id);

      console.log('[Sprint] Persisting sprint issues order:', targetSprintId, sprintIssueIds);
      sprintApi.reorderIssues(targetSprintId, sprintIssueIds).catch((err) => {
        console.error('Failed to persist sprint issues order:', err);
      });
    } else {
      // Reordered within the BACKLOG -> persist order to backend silently!
      const backlogIssueIds = currentList
        .filter((i) => !i.sprintId)
        .map((i) => i.id);

      console.log('[Backlog] Persisting backlog issues order:', projectId, backlogIssueIds);
      issueApi.reorderIssues(projectId, backlogIssueIds).catch((err) => {
        console.error('Failed to persist backlog issues order:', err);
      });
    }
  };

  const handleIssueDragStart = (e: React.DragEvent, issue: Issue) => {
    try {
      window.getSelection()?.removeAllRanges();
    } catch {
      // ignore
    }
    draggedIssueRef.current = issue;
    setDraggedIssue(issue);
    e.dataTransfer.setData('text/plain', issue.id);
    e.dataTransfer.effectAllowed = 'move';
    if (e.dataTransfer.setDragImage && e.currentTarget) {
      e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
    }
  };

  const handleIssueDragEnd = () => {
    draggedIssueRef.current = null;
    setDraggedIssue(null);
    setDragOverTarget(null);
  };

  const activeSprints = sprints.filter((s: Sprint) => s.status === 'ACTIVE');
  const plannedSprints = sprints.filter(
    (s: Sprint) => s.status === 'PLANNING' || s.status === 'PLANNED'
  );
  const displaySprints = [...activeSprints, ...plannedSprints];
  const backlogIssues = allIssues.filter((i: Issue) => !i.sprintId);

  if ((loadingSprints && sprints.length === 0) || (loadingIssues && allIssues.length === 0)) {
    return <BacklogSkeleton />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
        userSelect: 'none',
        animation: 'backlogFadeIn 0.25s ease-out forwards',
      }}
    >
      <style>{`
        @keyframes backlogFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
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
              let issueId = e.dataTransfer.getData('text/plain') || draggedIssueRef.current?.id || draggedIssue?.id;
              if (issueId && issueId.includes('\n')) {
                issueId = issueId.split('\n')[0].trim();
              }
              const issue = draggedIssueRef.current || draggedIssue || (issueId ? allIssues.find((i) => i.id === issueId || i.key === issueId) : null);
              if (!issue) return;
              if (issue.sprintId === sprint.id) return;

              let sourceSprintName = 'Backlog';
              if (issue.sprintId) {
                const found = sprints.find((s: Sprint) => s.id === issue.sprintId);
                if (found) sourceSprintName = found.name;
              }

              if (sprint.status === 'ACTIVE') {
                setPendingMove({
                  issue,
                  sourceSprintId: issue.sprintId,
                  sourceSprintName,
                  targetSprintId: sprint.id,
                  targetSprintName: sprint.name,
                  isTargetActive: true,
                });
              } else {
                moveIssueMutation.mutate({
                  issueId: issue.id,
                  issueKey: issue.key,
                  sourceSprintId: issue.sprintId,
                  targetSprintId: sprint.id,
                  targetSprintName: sprint.name,
                });
              }
              draggedIssueRef.current = null;
              setDraggedIssue(null);
            }}
            draggedIssueId={draggedIssue?.id}
            onIssueDragStart={handleIssueDragStart}
            onIssueDragEnd={handleIssueDragEnd}
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
            onDropOnIssue={handleDropOnIssue}
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
          let issueId = e.dataTransfer.getData('text/plain') || draggedIssueRef.current?.id || draggedIssue?.id;
          if (issueId && issueId.includes('\n')) {
            issueId = issueId.split('\n')[0].trim();
          }
          const issue = draggedIssueRef.current || draggedIssue || (issueId ? allIssues.find((i) => i.id === issueId || i.key === issueId) : null);
          if (!issue) return;
          if (!issue.sprintId) return;

          moveIssueMutation.mutate({
            issueId: issue.id,
            issueKey: issue.key,
            sourceSprintId: issue.sprintId,
            targetSprintId: undefined,
            targetSprintName: 'Backlog',
          });
          draggedIssueRef.current = null;
          setDraggedIssue(null);
        }}
        draggedIssueId={draggedIssue?.id}
        onIssueDragStart={handleIssueDragStart}
        onIssueDragEnd={handleIssueDragEnd}
        onSelectIssue={(id) => setSelectedIssueId(id)}
        onCreateSprint={() => createSprintMutation.mutate()}
        isCreatingSprint={createSprintMutation.isPending}
        onCreateIssue={() => {
          setTargetSprintId(undefined);
          setCreateIssueOpen(true);
        }}
        loadingIssues={loadingIssues && allIssues.length === 0}
        hasSprintsAbove={displaySprints.length > 0}
        onDropOnIssue={handleDropOnIssue}
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
