'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle, Search, Bookmark, CheckSquare, AlertCircle, Zap, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { sprintApi } from '@/lib/api/sprint';
import { issueApi } from '@/lib/api/issue';
import { projectApi } from '@/lib/api/project';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { CreateIssueModal } from '@/components/issue/CreateIssueModal';
import { IssueDetailModal } from '@/components/issue/IssueDetailModal';
import type { Issue, IssueStatus, IssueType, IssuePriority } from '@/types/issue';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const DEFAULT_COLUMNS: { id: IssueStatus; title: string; color: string }[] = [
  { id: 'TODO', title: 'TO DO', color: '#6b7280' },
  { id: 'IN_PROGRESS', title: 'IN PROGRESS', color: '#2563eb' },
  { id: 'IN_REVIEW', title: 'IN REVIEW', color: '#7e22ce' },
  { id: 'DONE', title: 'DONE', color: '#16a34a' },
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
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const completeSprintMutation = useMutation({
    mutationFn: (sprintId: string) => sprintApi.complete(sprintId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['board', projectId] });
      qc.invalidateQueries({ queryKey: ['sprints', projectId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Sprint completed!');
    },
    onError: () => toast.error('Failed to complete sprint'),
  });

  if (!projectId) return null;

  const activeSprint = boardData?.sprint;

  // Filter issues by search query
  const filterIssues = (issues: Issue[]) => {
    if (!query.trim()) return issues;
    const q = query.toLowerCase();
    return issues.filter(
      (i) => i.title.toLowerCase().includes(q) || i.key.toLowerCase().includes(q)
    );
  };

  const getTypeIcon = (type: IssueType) => {
    switch (type) {
      case 'EPIC': return <Zap size={14} color="#9333ea" />;
      case 'STORY': return <Bookmark size={14} color="#16a34a" fill="#16a34a" />;
      case 'BUG': return <AlertCircle size={14} color="#dc2626" />;
      case 'TASK':
      default: return <CheckSquare size={14} color="#2563eb" />;
    }
  };

  const getPriorityIcon = (priority: IssuePriority) => {
    switch (priority) {
      case 'HIGHEST':
      case 'HIGH':
        return <ArrowUp size={13} color="#dc2626" />;
      case 'LOW':
      case 'LOWEST':
        return <ArrowDown size={13} color="#2563eb" />;
      case 'MEDIUM':
      default:
        return <Minus size={13} color="#d97706" />;
    }
  };

  // Drag and Drop handlers with Jira-like visual effects
  const handleDragStart = (e: React.DragEvent, issueId: string) => {
    setDraggedIssueId(issueId);
    e.dataTransfer.setData('text/plain', issueId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnId: string) => {
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
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

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8125rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '4px',
            }}
          >
            <span>{project?.name || 'Project'}</span>
            <span>/</span>
            <span>Kanban Board</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {activeSprint ? activeSprint.name : 'Active Sprint Board'}
            </h1>
            {activeSprint && <span className="badge badge-green">ACTIVE</span>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {activeSprint && (
            <Button
              variant="outlined"
              onClick={() => completeSprintMutation.mutate(activeSprint.id)}
              loading={completeSprintMutation.isPending}
            >
              <CheckCircle size={15} /> Complete Sprint
            </Button>
          )}
          <Button onClick={() => setCreateIssueOpen(true)}>
            <Plus size={15} /> Create issue
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', width: 260 }}>
          <span style={{ position: 'absolute', left: 10, top: 9, color: 'var(--color-text-secondary)' }}>
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search board..."
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem', height: 34, fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {/* Board Columns Grid */}
      {loadingBoard ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading Kanban board...
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(260px, 1fr))',
            gap: '1rem',
            alignItems: 'start',
            overflowX: 'auto',
            paddingBottom: '1rem',
          }}
        >
          {DEFAULT_COLUMNS.map((col) => {
            const columnIssues = filterIssues(
              allIssues.filter((i) => i.status === col.id)
            );
            const totalPoints = columnIssues.reduce((acc, curr) => acc + (curr.storyPoints || 0), 0);
            const isHovered = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={(e) => handleDragLeave(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                style={{
                  backgroundColor: isHovered ? 'rgba(0, 117, 74, 0.06)' : 'rgba(0,0,0,0.03)',
                  borderRadius: 'var(--radius-card)',
                  padding: '12px',
                  minHeight: '520px',
                  display: 'flex',
                  flexDirection: 'column',
                  border: isHovered
                    ? '2px dashed var(--color-green-accent)'
                    : '1px solid rgba(0,0,0,0.06)',
                  transition: 'background-color 0.2s ease, border 0.2s ease',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    paddingBottom: '8px',
                    borderBottom: `2px solid ${col.color}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      {col.title}
                    </span>
                    <span
                      style={{
                        padding: '1px 7px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: 'rgba(0,0,0,0.08)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {columnIssues.length}
                    </span>
                  </div>

                  {totalPoints > 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      {totalPoints} pts
                    </span>
                  )}
                </div>

                {/* Cards Container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
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
                          backgroundColor: 'var(--color-surface-white)',
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: isDragging ? 'none' : 'var(--shadow-card)',
                          cursor: 'grab',
                          opacity: isDragging ? 0.4 : 1,
                          transform: isDragging ? 'scale(0.97)' : 'none',
                          border: isDragging
                            ? '1px dashed var(--color-green-accent)'
                            : '1px solid rgba(0,0,0,0.06)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isDragging) {
                            e.currentTarget.style.borderColor = 'var(--color-green-accent)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isDragging) {
                            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                          }
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'var(--color-text-primary)',
                            marginBottom: '10px',
                            lineHeight: 1.4,
                          }}
                        >
                          {issue.title}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {getTypeIcon(issue.type)}
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'var(--color-text-secondary)',
                                fontFamily: 'monospace',
                              }}
                            >
                              {issue.key}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {issue.storyPoints !== undefined && issue.storyPoints !== null && (
                              <span
                                style={{
                                  padding: '1px 5px',
                                  backgroundColor: 'rgba(0,0,0,0.06)',
                                  borderRadius: 'var(--radius-pill)',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                }}
                              >
                                {issue.storyPoints}
                              </span>
                            )}

                            <div title={`Priority: ${issue.priority}`}>
                              {getPriorityIcon(issue.priority)}
                            </div>

                            {issue.assignee ? (
                              <Avatar name={issue.assignee.fullName} src={issue.assignee.avatarUrl} size={22} />
                            ) : (
                              <div
                                style={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: '50%',
                                  border: '1px dashed rgba(0,0,0,0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.6rem',
                                  color: 'var(--color-text-secondary)',
                                }}
                                title="Unassigned"
                              >
                                ?
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {columnIssues.length === 0 && (
                    <div
                      style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.75rem',
                        border: isHovered
                          ? '1px dashed var(--color-green-accent)'
                          : '1px dashed rgba(0,0,0,0.15)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isHovered ? 'rgba(0, 117, 74, 0.04)' : 'transparent',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Drop items here
                    </div>
                  )}
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
      />
    </div>
  );
}
