'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, ChevronDown, MoreHorizontal, CheckCircle2, Bookmark,
  ChevronsUp, ArrowUp, Target, Plus, Kanban, ArrowRight, Calendar,
} from 'lucide-react';
import { sprintApi } from '@/lib/api/sprint';
import { issueApi } from '@/lib/api/issue';
import { projectApi } from '@/lib/api/project';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { toast } from '@/components/ui/Toast';
import { CreateIssueModal } from '@/components/issue/CreateIssueModal';
import { IssueDetailModal } from '@/components/issue/IssueDetailModal';
import { BoardSkeleton } from '@/components/board/BoardSkeleton';
import type { Issue, IssueStatus } from '@/types/issue';
import type { Sprint } from '@/types/sprint';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const BOARD_COLUMNS: { id: IssueStatus; title: string; color: string }[] = [
  { id: 'TODO', title: 'To Do', color: '#64748B' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#0284C7' },
  { id: 'IN_REVIEW', title: 'Review', color: '#8B5CF6' },
  { id: 'DONE', title: 'Done', color: '#00754A' },
];

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

export default function BoardPage() {
  const qc = useQueryClient();
  const routeParams = useParams();
  const projectId = (routeParams?.projectId as string) ?? '';

  const [query, setQuery] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

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

  const activeSprint = sprints.find((s: Sprint) => s.status === 'ACTIVE');

  const { data: boardData, isLoading: loadingBoard } = useQuery({
    queryKey: ['board', projectId],
    queryFn: () => (projectId && activeSprint ? sprintApi.getBoard(projectId).then((r) => r.data) : null),
    enabled: Boolean(projectId && activeSprint),
    staleTime: 1000 * 60 * 5,
  });

  const { data: issuesPage, isLoading: loadingIssues } = useQuery({
    queryKey: ['issues', projectId],
    queryFn: () => (projectId ? issueApi.list(projectId) : null),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 5,
  });

  const allIssues: Issue[] = issuesPage?.data ?? [];

  // Issues belonging to the active sprint
  const boardIssues = Array.isArray(boardData)
    ? boardData.flatMap((col: any) => col.issues || [])
    : [];

  const sprintIssues = allIssues.filter((i) => i.sprintId === activeSprint?.id);

  const activeIssues = sprintIssues.length > 0
    ? sprintIssues
    : boardIssues.length > 0
    ? boardIssues
    : [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ issueId, status }: { issueId: string; status: IssueStatus }) =>
      issueApi.updateStatus(issueId, status),
    onMutate: async ({ issueId, status }) => {
      await qc.cancelQueries({ queryKey: ['issues', projectId] });
      await qc.cancelQueries({ queryKey: ['board', projectId] });

      const previousIssues = qc.getQueryData<any>(['issues', projectId]);

      if (previousIssues && Array.isArray(previousIssues.data)) {
        qc.setQueryData(['issues', projectId], {
          ...previousIssues,
          data: previousIssues.data.map((issue: Issue) =>
            issue.id === issueId ? { ...issue, status } : issue
          ),
        });
      }

      return { previousIssues };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousIssues) {
        qc.setQueryData(['issues', projectId], context.previousIssues);
      }
      toast.error('Failed to update status');
    },
    onSettled: (_, _error, variables) => {
      qc.invalidateQueries({ queryKey: ['issues', projectId], refetchType: 'none' });
      qc.invalidateQueries({ queryKey: ['board', projectId], refetchType: 'none' });
      qc.invalidateQueries({ queryKey: ['issue', variables.issueId], refetchType: 'none' });
    },
  });

  const completeSprintMutation = useMutation({
    mutationFn: (sprintId: string) => sprintApi.complete(sprintId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] });
      qc.invalidateQueries({ queryKey: ['board', projectId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Sprint completed successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to complete sprint');
    },
  });

  if (!projectId) return null;

  // Filter issues by search query
  const filterIssues = (issues: Issue[]) => {
    if (!query.trim()) return issues;
    const q = query.toLowerCase();
    return issues.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.key.toLowerCase().includes(q) ||
        i.tags?.some((t) => t.toLowerCase().includes(q))
    );
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, issueId: string) => {
    setDraggedIssueId(issueId);
    e.dataTransfer.setData('text/plain', issueId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: React.DragEvent, columnId: string) => {
    if (dragOverColumn === columnId) setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: IssueStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const issueId = e.dataTransfer.getData('text/plain') || draggedIssueId;
    if (issueId) {
      updateStatusMutation.mutate({ issueId, status: targetStatus });
      setDraggedIssueId(null);
    }
  };

  // Helper for tag background and text colors
  const getTagStyle = (tag: string) => {
    switch (tag) {
      case 'ILLUSTRATION':
        return { bg: '#EDE9FE', color: '#6D28D9' };
      case 'HI-FI DESIGN':
        return { bg: '#E0F2FE', color: '#0369A1' };
      case 'PROTOTYPE':
        return { bg: '#F3E8FF', color: '#7E22CE' };
      case 'WIREFRAMES':
      case 'IA':
        return { bg: '#FEF9C3', color: '#A16207' };
      case 'TASK FLOW':
        return { bg: '#FCE7F3', color: '#BE185D' };
      case 'USER PERSONAS':
      case 'USER STORIES':
        return { bg: '#DCFCE7', color: '#15803D' };
      case 'UX':
      default:
        return { bg: '#F3F4F6', color: '#4B5563' };
    }
  };

  // If sprints or board data are still loading on initial fetch
  if ((loadingSprints && sprints.length === 0) || (loadingBoard && !boardData)) {
    return <BoardSkeleton />;
  }

  // If there is NO active sprint, render empty state with Backlog redirect button
  if (!activeSprint) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Board
          </h1>
          <Link
            href={`/projects/${projectId}/backlog`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.875rem',
              color: 'var(--color-green-accent)',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: 4,
            }}
          >
            Backlog <ArrowRight size={14} />
          </Link>
        </div>

        {/* Empty State Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #DFE1E6',
            padding: '5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxShadow: '0 1px 4px rgba(9, 30, 66, 0.05)',
            marginTop: '0.5rem',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#EBF5F0',
              border: '2px solid #C5E4D4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <Kanban size={38} color="var(--color-green-brand)" />
          </div>

          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '0.75rem',
              letterSpacing: '-0.01em',
            }}
          >
            You haven&apos;t started a sprint
          </h2>

          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--color-text-secondary)',
              maxWidth: 480,
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            You can&apos;t do any work on the board until you start a sprint. Go to your backlog to plan work items and start a sprint. Once started, active tasks will show up on this board.
          </p>

          <Link
            href={`/projects/${projectId}/backlog`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              backgroundColor: 'var(--color-green-accent)',
              color: '#FFFFFF',
              fontSize: '0.9375rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-pill)',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0, 117, 74, 0.25)',
              transition: 'background-color 0.15s, transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-green-brand)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 98, 65, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-green-accent)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 117, 74, 0.25)';
            }}
          >
            Go to backlog <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // Active Sprint is present -> Full Board Operations
  const sprintDateRange = formatSprintDates(activeSprint.startDate, activeSprint.endDate);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        animation: 'boardFadeIn 0.25s ease-out forwards',
      }}
    >
      <style>{`
        @keyframes boardFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* Top Header with Active Sprint Info & Complete Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #DFE1E6',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            {activeSprint.name}
          </h1>

          <span
            style={{
              backgroundColor: 'var(--color-green-accent)',
              color: '#FFFFFF',
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 4,
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            ACTIVE SPRINT
          </span>

          {sprintDateRange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
              <Calendar size={14} />
              <span>{sprintDateRange}</span>
            </div>
          )}

          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            ({activeIssues.length} {activeIssues.length === 1 ? 'work item' : 'work items'})
          </span>

          {activeSprint.goal && (
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
                fontStyle: 'italic',
                maxWidth: 280,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={activeSprint.goal}
            >
              • {activeSprint.goal}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => completeSprintMutation.mutate(activeSprint.id)}
            disabled={completeSprintMutation.isPending}
            style={{
              height: 32,
              padding: '0 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-green-accent)',
              backgroundColor: 'var(--color-green-accent)',
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
              e.currentTarget.style.backgroundColor = 'var(--color-green-brand)';
              e.currentTarget.style.borderColor = 'var(--color-green-brand)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-green-accent)';
              e.currentTarget.style.borderColor = 'var(--color-green-accent)';
            }}
          >
            {completeSprintMutation.isPending ? 'Completing...' : 'Complete sprint'}
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div style={{ position: 'relative', width: 260 }}>
          <span style={{ position: 'absolute', left: 12, top: 10, color: 'var(--color-text-secondary)' }}>
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search active sprint"
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', height: 38, borderRadius: 'var(--radius-pill)', fontSize: '0.875rem' }}
          />
        </div>

        <button
          className="btn btn-ghost btn-sm"
          style={{
            height: 38,
            padding: '0 14px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(0,0,0,0.12)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Quick Filters <ChevronDown size={14} style={{ marginLeft: 4 }} />
        </button>
      </div>

      {/* Board Columns Grid */}
      {(loadingBoard || loadingIssues) && activeIssues.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading Board...
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(280px, 1fr))',
            gap: '1.25rem',
            alignItems: 'start',
            overflowX: 'auto',
            paddingBottom: '1.5rem',
          }}
        >
          {BOARD_COLUMNS.map((col) => {
            const columnIssues = filterIssues(activeIssues.filter((i) => i.status === col.id));
            const isHovered = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={(e) => handleDragLeave(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                style={{
                  backgroundColor: isHovered ? '#EBF5F0' : '#f8fafc',
                  border: isHovered ? '2px dashed var(--color-green-accent)' : '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '14px 12px',
                  minHeight: '560px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    padding: '0 4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.color }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                      {col.title}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#64748b',
                        backgroundColor: '#e2e8f0',
                        padding: '2px 8px',
                        borderRadius: '12px',
                      }}
                    >
                      {columnIssues.length}
                    </span>
                  </div>
                  <MoreHorizontal size={18} color="var(--color-text-secondary)" style={{ cursor: 'pointer' }} />
                </div>

                {/* "+ Add Task" dotted button in To Do column */}
                {col.id === 'TODO' && (
                  <button
                    onClick={() => setCreateIssueOpen(true)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'rgba(0, 117, 74, 0.08)',
                      border: '1px dashed var(--color-green-accent)',
                      color: 'var(--color-green-brand)',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      marginBottom: '1rem',
                      transition: 'var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 117, 74, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 117, 74, 0.08)';
                    }}
                  >
                    Add Task +
                  </button>
                )}

                {/* Cards List */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    flex: 1,
                    maxHeight: '580px',
                    overflowY: 'auto',
                    paddingRight: '4px',
                    scrollbarWidth: 'thin',
                  }}
                >
                  {columnIssues.map((issue) => {
                    const isDragging = draggedIssueId === issue.id;

                    return (
                      <div
                        key={issue.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, issue.id)}
                        onDragEnd={() => {
                          setDraggedIssueId(null);
                          setDragOverColumn(null);
                        }}
                        onClick={() => setSelectedIssueId(issue.id)}
                        style={{
                          backgroundColor: '#ffffff',
                          padding: '16px',
                          borderRadius: '12px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
                          cursor: 'grab',
                          opacity: isDragging ? 0.4 : 1,
                          transform: isDragging ? 'scale(0.98)' : 'none',
                          border: '1px solid #cbd5e1',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isDragging) {
                            e.currentTarget.style.borderColor = '#94a3b8';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isDragging) {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)';
                            e.currentTarget.style.transform = 'none';
                          }
                        }}
                      >
                        {/* Category Tag Pills */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '10px', flexWrap: 'wrap' }}>
                          {(issue.tags ?? ['TASK']).map((tag, tIdx) => {
                            const tagStyle = getTagStyle(tag);
                            return (
                              <span
                                key={tIdx}
                                style={{
                                  padding: '3px 10px',
                                  borderRadius: 'var(--radius-pill)',
                                  backgroundColor: tagStyle.bg,
                                  color: tagStyle.color,
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  letterSpacing: '0.04em',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                {tag}
                              </span>
                            );
                          })}

                          {/* Crosshair target icon */}
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              border: '1px dashed rgba(0,0,0,0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--color-text-secondary)',
                            }}
                          >
                            <Target size={12} />
                          </div>
                        </div>

                        {/* Issue Title */}
                        <div
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--color-text-primary)',
                            marginBottom: '10px',
                            lineHeight: 1.45,
                          }}
                        >
                          {issue.title}
                        </div>

                        {/* Subtext / Progress Line */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: 4 }}>
                            {issue.subtext ??
                              (issue.status === 'TODO'
                                ? 'Not started yet'
                                : issue.status === 'DONE'
                                ? 'Task finished'
                                : 'In Progress')}
                          </div>

                          {/* Progress Line */}
                          <div style={{ width: '100%', height: 3, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${
                                  issue.progressPercent ??
                                  (issue.status === 'DONE'
                                    ? 100
                                    : issue.status === 'IN_REVIEW'
                                    ? 85
                                    : issue.status === 'IN_PROGRESS'
                                    ? 50
                                    : 0)
                                }%`,
                                height: '100%',
                                backgroundColor: col.color,
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </div>
                        </div>

                        {/* Card Footer: Icons + Stacked Avatars */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
                          {/* Left Icons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {issue.status === 'TODO' && issue.tags?.includes('HI-FI DESIGN') ? (
                              <Bookmark size={15} color="#16A34A" fill="#16A34A" />
                            ) : issue.status === 'DONE' || issue.status === 'IN_REVIEW' || issue.progressPercent ? (
                              <CheckCircle2 size={16} color="#0284C7" />
                            ) : (
                              <ArrowUp size={15} color="#16A34A" />
                            )}
                            <ChevronsUp size={16} color="#DC2626" />
                          </div>

                          {/* Right Assignee Display matching display name */}
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                            title={issue.assignee?.fullName ?? 'Assignee'}
                          >
                            <Avatar name={issue.assignee?.fullName ?? 'Assignee'} size={24} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                              {issue.assignee?.fullName ?? 'Assignee'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateIssueModal
        open={createIssueOpen}
        onClose={() => setCreateIssueOpen(false)}
        projectId={projectId}
        initialSprintId={activeSprint?.id}
      />

      <IssueDetailModal
        issueId={selectedIssueId}
        projectId={projectId}
        onClose={() => setSelectedIssueId(null)}
        issues={activeIssues}
        onNavigateIssue={(id) => setSelectedIssueId(id)}
      />
    </div>
  );
}
