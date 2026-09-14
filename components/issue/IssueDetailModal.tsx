'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Trash2, Send, Clock, MessageSquare, CheckSquare, Bookmark, AlertCircle, Zap } from 'lucide-react';
import { issueApi } from '@/lib/api/issue';
import { projectApi } from '@/lib/api/project';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { commentSchema, type CommentFormData } from '@/lib/validations/issue';
import type { IssueType, IssuePriority, IssueStatus } from '@/types/issue';

interface IssueDetailModalProps {
  issueId: string | null;
  projectId: string;
  onClose: () => void;
}

export function IssueDetailModal({ issueId, projectId, onClose }: IssueDetailModalProps) {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  const { data: issue, isLoading } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => (issueId ? issueApi.get(issueId).then(r => r.data) : null),
    enabled: Boolean(issueId),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectApi.listMembers(projectId).then(r => r.data),
    enabled: Boolean(issueId),
  });

  const { data: history = [] } = useQuery({
    queryKey: ['issue-history', issueId],
    queryFn: () => (issueId ? issueApi.getHistory(issueId).then(r => r.data) : []),
    enabled: Boolean(issueId) && activeTab === 'history',
  });

  const updateMutation = useMutation({
    mutationFn: (data: { title?: string; description?: string; status?: IssueStatus; priority?: IssuePriority; type?: IssueType; assigneeId?: string | null; storyPoints?: number }) =>
      issueId ? issueApi.update(issueId, data) : Promise.reject(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Issue updated');
      setIsEditingTitle(false);
    },
    onError: () => toast.error('Failed to update issue'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => (issueId ? issueApi.delete(issueId) : Promise.reject()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Issue deleted');
      onClose();
    },
    onError: () => toast.error('Failed to delete issue'),
  });

  const commentForm = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: CommentFormData) => (issueId ? issueApi.addComment(issueId, data.content) : Promise.reject()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      commentForm.reset();
      toast.success('Comment added');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  if (!issueId) return null;

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'flex-end',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '750px',
          height: '100%',
          backgroundColor: 'var(--color-surface-white)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-modal)',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            background: 'var(--color-surface-white)',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {getTypeIcon(issue?.type)}
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
              {issue?.key}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this issue?')) {
                  deleteMutation.mutate();
                }
              }}
              style={{ color: 'var(--color-red)' }}
              title="Delete issue"
            >
              <Trash2 size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading issue details...
          </div>
        ) : issue ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', padding: '1.5rem' }}>
            {/* Left Column: Title, Description, Tabs */}
            <div>
              {/* Editable Title */}
              {isEditingTitle ? (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    className="input"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => updateMutation.mutate({ title: titleValue })}
                    loading={updateMutation.isPending}
                  >
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <h2
                  onClick={() => {
                    setTitleValue(issue.title);
                    setIsEditingTitle(true);
                  }}
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    marginBottom: '1.25rem',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: 'var(--radius-sm)',
                  }}
                  title="Click to edit title"
                >
                  {issue.title}
                </h2>
              )}

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
                  Description
                </h4>
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-canvas-warm)',
                    fontSize: '0.875rem',
                    minHeight: '80px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {issue.description || <span style={{ color: 'var(--color-text-secondary)' }}>No description provided.</span>}
                </div>
              </div>

              {/* Tabs: Comments / History */}
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: '1rem' }}>
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

              {/* Tab Content */}
              {activeTab === 'comments' ? (
                <div>
                  {/* Add Comment */}
                  <form
                    onSubmit={commentForm.handleSubmit((d) => addCommentMutation.mutate(d))}
                    style={{ marginBottom: '1.25rem' }}
                  >
                    <textarea
                      placeholder="Add a comment..."
                      className="input"
                      rows={2}
                      {...commentForm.register('content')}
                      style={{ resize: 'vertical', marginBottom: '0.5rem' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button size="sm" type="submit" loading={addCommentMutation.isPending}>
                        <Send size={14} /> Comment
                      </Button>
                    </div>
                  </form>

                  {/* Comment List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {issue.comments?.map((c) => (
                      <div key={c.id} style={{ display: 'flex', gap: '0.75rem' }}>
                        <Avatar name={c.author.fullName} src={c.author.avatarUrl} size={24} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{c.author.fullName}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {history.map((h) => (
                    <div key={h.id} style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      <strong>{h.changedBy.fullName}</strong> updated <strong>{h.field}</strong> from{' '}
                      <em>{h.oldValue || 'none'}</em> to <em>{h.newValue || 'none'}</em>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>No activity recorded yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Metadata & Field Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Status */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  STATUS
                </label>
                <select
                  value={issue.status}
                  onChange={(e) => updateMutation.mutate({ status: e.target.value as IssueStatus })}
                  className="input"
                  style={{ height: 36, fontSize: '0.875rem' }}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  PRIORITY
                </label>
                <select
                  value={issue.priority}
                  onChange={(e) => updateMutation.mutate({ priority: e.target.value as IssuePriority })}
                  className="input"
                  style={{ height: 36, fontSize: '0.875rem' }}
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
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  ASSIGNEE
                </label>
                <select
                  value={issue.assignee?.id || ''}
                  onChange={(e) => updateMutation.mutate({ assigneeId: e.target.value || null })}
                  className="input"
                  style={{ height: 36, fontSize: '0.875rem' }}
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
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
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
                  style={{ height: 36, fontSize: '0.875rem' }}
                  min={0}
                  max={100}
                />
              </div>

              {/* Reporter */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  REPORTER
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                  <Avatar name={issue.reporter?.fullName || 'Reporter'} src={issue.reporter?.avatarUrl} size={24} />
                  <span style={{ fontSize: '0.875rem' }}>{issue.reporter?.fullName}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
