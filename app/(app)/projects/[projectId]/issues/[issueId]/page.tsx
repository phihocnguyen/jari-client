'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Send, Clock, MessageSquare, CheckSquare, Bookmark, AlertCircle, Zap } from 'lucide-react';
import { issueApi } from '@/lib/api/issue';
import { projectApi } from '@/lib/api/project';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { commentSchema, type CommentFormData } from '@/lib/validations/issue';
import type { IssueType, IssuePriority, IssueStatus } from '@/types/issue';

interface PageProps {
  params: Promise<{ projectId: string; issueId: string }>;
}

function renderHistoryValueBadge(field: string, val?: string) {
  if (!val || val === 'none') {
    return (
      <span
        style={{
          color: '#94a3b8',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: '0.75rem',
        }}
      >
        None
      </span>
    );
  }

  const normField = field.toLowerCase().trim();
  const normVal = val.toUpperCase().trim();

  // Priority values: High/Highest (Red), Medium (Amber/Yellow), Low/Lowest (Green)
  if (normField === 'priority' || ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'].includes(normVal)) {
    if (normVal === 'HIGHEST' || normVal === 'HIGH') {
      return (
        <span
          style={{
            fontWeight: 700,
            color: '#dc2626',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: '0.75rem',
          }}
        >
          {val}
        </span>
      );
    }
    if (normVal === 'MEDIUM') {
      return (
        <span
          style={{
            fontWeight: 700,
            color: '#d97706',
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: '0.75rem',
          }}
        >
          {val}
        </span>
      );
    }
    return (
      <span
        style={{
          fontWeight: 700,
          color: '#15803d',
          backgroundColor: '#dcfce7',
          border: '1px solid #86efac',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: '0.75rem',
        }}
      >
        {val}
      </span>
    );
  }

  // Status values:
  if (normField === 'status' || ['TODO', 'IN_PROGRESS', 'IN PROGRESS', 'IN_REVIEW', 'IN REVIEW', 'DONE', 'TO DO'].includes(normVal)) {
    let bg = '#f1f2f4';
    let color = '#44546f';
    let border = '#dcdfe4';

    if (normVal === 'DONE') {
      bg = '#e3fcef';
      color = '#006644';
      border = '#abf5d1';
    } else if (normVal.includes('PROGRESS')) {
      bg = '#e9f2ff';
      color = '#0c66e4';
      border = '#cce0ff';
    } else if (normVal.includes('REVIEW')) {
      bg = '#f3e8ff';
      color = '#6b21a8';
      border = '#e9d5ff';
    }

    return (
      <span
        style={{
          fontWeight: 700,
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: '0.75rem',
        }}
      >
        {val}
      </span>
    );
  }

  // Default value highlight badge (no line-through)
  return (
    <span
      style={{
        fontWeight: 600,
        color: '#0c66e4',
        backgroundColor: '#e9f2ff',
        border: '1px solid #cce0ff',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: '0.75rem',
      }}
    >
      {val}
    </span>
  );
}

export default function IssueDetailPage({ params }: PageProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const [resolvedParams, setResolvedParams] = useState<{ projectId: string; issueId: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  const projectId = resolvedParams?.projectId ?? '';
  const issueId = resolvedParams?.issueId ?? '';

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? projectApi.get(projectId).then(r => r.data) : null),
    enabled: Boolean(projectId),
  });

  const { data: issue, isLoading } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => (issueId ? issueApi.get(issueId).then(r => r.data) : null),
    enabled: Boolean(issueId),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => (projectId ? projectApi.listMembers(projectId).then(r => r.data) : []),
    enabled: Boolean(projectId),
  });

  const { data: history = [] } = useQuery({
    queryKey: ['issue-history', issueId],
    queryFn: () => (issueId ? issueApi.getHistory(issueId) : []),
    enabled: Boolean(issueId) && activeTab === 'history',
  });

  const updateMutation = useMutation({
    mutationFn: (data: { title?: string; description?: string; status?: IssueStatus; priority?: IssuePriority; type?: IssueType; assigneeId?: string | null; storyPoints?: number }) =>
      issueApi.update(issueId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      toast.success('Issue updated');
    },
    onError: () => toast.error('Failed to update issue'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => issueApi.delete(issueId),
    onSuccess: () => {
      toast.success('Issue deleted');
      router.push(`/projects/${projectId}/backlog`);
    },
    onError: () => toast.error('Failed to delete issue'),
  });

  const commentForm = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: CommentFormData) => issueApi.addComment(issueId, data.content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      commentForm.reset();
      toast.success('Comment added');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  if (!projectId || !issueId) return null;

  const getTypeIcon = (type?: IssueType) => {
    switch (type) {
      case 'EPIC': return <Zap size={16} color="#9333ea" />;
      case 'STORY': return <Bookmark size={16} color="#16a34a" fill="#16a34a" />;
      case 'BUG': return <AlertCircle size={16} color="#dc2626" />;
      case 'TASK':
      default: return <CheckSquare size={16} color="#2563eb" />;
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Breadcrumb & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <Link
            href={`/projects/${projectId}/backlog`}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
          >
            <ArrowLeft size={16} />
            Back to backlog
          </Link>
          <span style={{ color: 'var(--color-text-secondary)' }}>/</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>{project?.name}</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>/</span>
          <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{issue?.key}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this issue?')) {
              deleteMutation.mutate();
            }
          }}
          style={{ color: 'var(--color-red)' }}
        >
          <Trash2 size={16} /> Delete
        </Button>
      </div>

      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading issue...
        </div>
      ) : issue ? (
        <div
          style={{
            backgroundColor: 'var(--color-surface-white)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid rgba(0,0,0,0.08)',
            padding: '2rem',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2.5rem',
          }}
        >
          {/* Main Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              {getTypeIcon(issue.type)}
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                {issue.key}
              </span>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem', lineHeight: 1.3 }}>
              {issue.title}
            </h1>

            {/* Description */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Description
              </h3>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-canvas-warm)',
                  fontSize: '0.9375rem',
                  minHeight: '100px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {issue.description || <span style={{ color: 'var(--color-text-secondary)' }}>No description provided.</span>}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: '1.25rem' }}>
              <button
                onClick={() => setActiveTab('comments')}
                style={{
                  padding: '0.5rem 0.25rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'comments' ? '2px solid var(--color-green-accent)' : '2px solid transparent',
                  fontWeight: activeTab === 'comments' ? 600 : 500,
                  color: activeTab === 'comments' ? 'var(--color-green-accent)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.875rem',
                }}
              >
                <MessageSquare size={14} /> Comments ({issue.comments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                style={{
                  padding: '0.5rem 0.25rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'history' ? '2px solid var(--color-green-accent)' : '2px solid transparent',
                  fontWeight: activeTab === 'history' ? 600 : 500,
                  color: activeTab === 'history' ? 'var(--color-green-accent)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.875rem',
                }}
              >
                <Clock size={14} /> Activity
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'comments' ? (
              <div>
                <form
                  onSubmit={commentForm.handleSubmit((d) => addCommentMutation.mutate(d))}
                  style={{ marginBottom: '1.5rem' }}
                >
                  <textarea
                    placeholder="Add a comment..."
                    className="input"
                    rows={3}
                    {...commentForm.register('content')}
                    style={{ resize: 'vertical', marginBottom: '0.5rem' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button size="sm" type="submit" loading={addCommentMutation.isPending}>
                      <Send size={14} /> Comment
                    </Button>
                  </div>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {issue.comments?.map((c) => (
                    <div key={c.id} style={{ display: 'flex', gap: '0.75rem' }}>
                      <Avatar name={c.author.fullName} src={c.author.avatarUrl} size={28} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{c.author.fullName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                          {c.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {history.map((h) => {
                  const userName = h.changedBy?.fullName || 'Học Nguyễn';
                  return (
                    <div
                      key={h.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-primary)',
                        flexWrap: 'wrap',
                      }}
                    >
                      <strong style={{ color: 'var(--color-text-primary)' }}>{userName}</strong>
                      <span style={{ color: 'var(--color-text-secondary)' }}>updated</span>
                      <span
                        style={{
                          fontWeight: 600,
                          backgroundColor: '#f1f2f4',
                          color: '#172b4d',
                          padding: '1px 8px',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        {h.field}
                      </span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>from</span>
                      {renderHistoryValueBadge(h.field, h.oldValue)}
                      <span style={{ color: 'var(--color-text-secondary)' }}>to</span>
                      {renderHistoryValueBadge(h.field, h.newValue)}
                    </div>
                  );
                })}
                {history.length === 0 && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>No activity recorded yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Details Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderLeft: '1px solid rgba(0,0,0,0.06)', paddingLeft: '1.5rem' }}>
            {/* Status */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                STATUS
              </label>
              <select
                value={issue.status}
                onChange={(e) => updateMutation.mutate({ status: e.target.value as IssueStatus })}
                className="input"
                style={{ height: 38, fontSize: '0.875rem' }}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                PRIORITY
              </label>
              <select
                value={issue.priority}
                onChange={(e) => updateMutation.mutate({ priority: e.target.value as IssuePriority })}
                className="input"
                style={{ height: 38, fontSize: '0.875rem' }}
              >
                <option value="HIGHEST">Highest</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="LOWEST">Lowest</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                ASSIGNEE
              </label>
              <select
                value={issue.assignee?.id || ''}
                onChange={(e) => updateMutation.mutate({ assigneeId: e.target.value || null })}
                className="input"
                style={{ height: 38, fontSize: '0.875rem' }}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Story Points */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                STORY POINTS
              </label>
              <input
                type="number"
                defaultValue={issue.storyPoints ?? ''}
                onBlur={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  if (val !== issue.storyPoints) {
                    updateMutation.mutate({ storyPoints: val });
                  }
                }}
                className="input"
                style={{ height: 38, fontSize: '0.875rem' }}
                min={0}
                max={100}
              />
            </div>

            {/* Reporter */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                REPORTER
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                <Avatar name={issue.reporter?.fullName || 'Reporter'} src={issue.reporter?.avatarUrl} size={28} />
                <span style={{ fontSize: '0.875rem' }}>{issue.reporter?.fullName}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
