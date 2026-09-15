'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, ChevronDown, MoreHorizontal, CheckCircle2, Bookmark,
  ChevronsUp, ArrowUp, Target, Plus,
} from 'lucide-react';
import { sprintApi } from '@/lib/api/sprint';
import { issueApi } from '@/lib/api/issue';
import { projectApi } from '@/lib/api/project';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { toast } from '@/components/ui/Toast';
import { CreateIssueModal } from '@/components/issue/CreateIssueModal';
import { IssueDetailModal } from '@/components/issue/IssueDetailModal';
import { SprintTimeline } from '@/components/sprint/SprintTimeline';
import type { Issue, IssueStatus } from '@/types/issue';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const BOARD_COLUMNS: { id: IssueStatus; title: string; color: string }[] = [
  { id: 'TODO', title: 'To Do', color: '#6366F1' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#F97316' },
  { id: 'IN_REVIEW', title: 'Review', color: '#EC4899' },
  { id: 'DONE', title: 'Done', color: '#22C55E' },
];

export default function BoardPage({ params }: PageProps) {
  const qc = useQueryClient();
  const [resolvedParams, setResolvedParams] = useState<{ projectId: string } | null>(null);
  const [query, setQuery] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  const projectId = resolvedParams?.projectId ?? '';

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? projectApi.get(projectId).then(r => r.data) : null),
    enabled: Boolean(projectId),
  });

  const { data: boardData, isLoading: loadingBoard } = useQuery({
    queryKey: ['board', projectId],
    queryFn: () => (projectId ? sprintApi.getBoard(projectId).then(r => r.data) : null),
    enabled: Boolean(projectId),
  });

  const { data: issuesPage } = useQuery({
    queryKey: ['issues', projectId],
    queryFn: () => (projectId ? issueApi.list(projectId) : null),
    enabled: Boolean(projectId),
  });

  const allIssues: Issue[] = issuesPage?.data ?? [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ issueId, status }: { issueId: string; status: IssueStatus }) =>
      issueApi.updateStatus(issueId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['board', projectId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Task status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  if (!projectId) return null;

  // Filter issues by search query
  const filterIssues = (issues: Issue[]) => {
    if (!query.trim()) return issues;
    const q = query.toLowerCase();
    return issues.filter(
      (i) => i.title.toLowerCase().includes(q) || i.key.toLowerCase().includes(q) || i.tags?.some(t => t.toLowerCase().includes(q))
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '0.25rem',
      }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Board
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="outlined" style={{ borderRadius: 'var(--radius-pill)', borderColor: 'rgba(0,0,0,0.15)' }}>
            Release
          </Button>
          <button className="btn btn-ghost btn-icon" aria-label="More options">
            <MoreHorizontal size={20} color="var(--color-text-secondary)" />
          </button>
        </div>
      </div>

      {/* Sprint Timeline Navigation Bar */}
      <SprintTimeline />

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', width: 260 }}>
          <span style={{ position: 'absolute', left: 12, top: 10, color: 'var(--color-text-secondary)' }}>
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search"
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', height: 38, borderRadius: 'var(--radius-pill)', fontSize: '0.875rem' }}
          />
        </div>

        <button
          className="btn btn-ghost btn-sm"
          style={{
            height: 38, padding: '0 14px', borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(0,0,0,0.12)', color: 'var(--color-text-secondary)',
          }}
        >
          Quick Filters <ChevronDown size={14} style={{ marginLeft: 4 }} />
        </button>
      </div>

      {/* Board Columns Grid */}
      {loadingBoard ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading Board...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(280px, 1fr))',
          gap: '1.25rem',
          alignItems: 'start',
          overflowX: 'auto',
          paddingBottom: '1.5rem',
        }}>
          {BOARD_COLUMNS.map((col) => {
            const columnIssues = filterIssues(allIssues.filter((i) => i.status === col.id));
            const isHovered = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={(e) => handleDragLeave(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                style={{
                  backgroundColor: isHovered ? 'rgba(0, 117, 74, 0.04)' : 'transparent',
                  borderRadius: 'var(--radius-card)',
                  minHeight: '560px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {/* Column Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '1rem', padding: '0 4px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.color }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                      {col.title} ({columnIssues.length})
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
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      border: '1px dashed #6366F1',
                      color: '#4F46E5',
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
                  >
                    Add Task +
                  </button>
                )}

                {/* Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {columnIssues.map((issue) => {
                    const isDragging = draggedIssueId === issue.id;

                    return (
                      <div
                        key={issue.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, issue.id)}
                        onDragEnd={() => { setDraggedIssueId(null); setDragOverColumn(null); }}
                        onClick={() => setSelectedIssueId(issue.id)}
                        style={{
                          backgroundColor: 'var(--color-surface-white)',
                          padding: '16px',
                          borderRadius: '16px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          cursor: 'grab',
                          opacity: isDragging ? 0.4 : 1,
                          transform: isDragging ? 'scale(0.98)' : 'none',
                          border: '1px solid rgba(0,0,0,0.06)',
                          transition: 'var(--transition-base)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isDragging) {
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isDragging) {
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
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
                          <div style={{
                            width: 20, height: 20, borderRadius: '50%',
                            border: '1px dashed rgba(0,0,0,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--color-text-secondary)',
                          }}>
                            <Target size={12} />
                          </div>
                        </div>

                        {/* Issue Title */}
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                          marginBottom: '10px',
                          lineHeight: 1.45,
                        }}>
                          {issue.title}
                        </div>

                        {/* Subtext / Progress Line */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: 4 }}>
                            {issue.subtext ?? (issue.status === 'TODO' ? 'Not started yet' : issue.status === 'DONE' ? 'Task finished' : 'In Progress')}
                          </div>

                          {/* Progress Line */}
                          <div style={{ width: '100%', height: 3, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                            <div style={{
                              width: `${issue.progressPercent ?? (issue.status === 'DONE' ? 100 : issue.status === 'IN_REVIEW' ? 85 : issue.status === 'IN_PROGRESS' ? 50 : 0)}%`,
                              height: '100%',
                              backgroundColor: col.color,
                              transition: 'width 0.3s ease',
                            }} />
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

                          {/* Right Stacked Avatars */}
                          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
                            <div style={{ zIndex: 3, marginRight: -6 }}>
                              <Avatar name={issue.assignee?.fullName ?? 'Admin User'} size={24} />
                            </div>
                            <div style={{ zIndex: 2, marginRight: -6 }}>
                              <Avatar name="Sarah Chen" size={24} />
                            </div>
                            <div style={{
                              zIndex: 1, width: 24, height: 24, borderRadius: '50%',
                              backgroundColor: '#3B82F6', color: '#fff',
                              fontSize: '0.65rem', fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: '2px solid #fff',
                            }}>
                              +{issue.extraAssigneeCount ?? 4}
                            </div>
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
