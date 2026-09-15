'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, SlidersHorizontal } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { Comment, IssueHistory } from '@/types/issue';

import { getUserInitials } from '@/utils/user';
import { formatDate, timeAgo } from '@/utils/date';
import { renderTextWithIssueKeys } from '@/utils/issueText';

interface TaskActivityProps {
  comments: Comment[];
  history: IssueHistory[];
  projectId?: string;
  onAddComment: (content: string) => void;
  isAddingComment: boolean;
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

export function TaskActivity({
  comments,
  history,
  projectId = '',
  onAddComment,
  isAddingComment,
}: TaskActivityProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'history' | 'all' | 'worklog'>('comments');
  const [commentContent, setCommentContent] = useState('');
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const commentPrompts = [
    'Who is working on this...?',
    'Can I get more info...?',
    'Status update...',
  ];

  // Keyboard shortcut 'M' to focus comment input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (e.key === 'm' || e.key === 'M') {
        if (!isInput) {
          e.preventDefault();
          commentInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveComment = () => {
    if (commentContent.trim()) {
      onAddComment(commentContent.trim());
      setCommentContent('');
    }
  };

  // Newest comments first
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#44546f', marginBottom: 12 }}>
        Activity
      </h3>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'comments', label: `Comments (${comments.length})` },
            { key: 'history', label: 'History' },
            { key: 'worklog', label: 'Work log' },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: '8px 4px',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #0c66e4' : '2px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#0c66e4' : '#626f86',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          title="Sort activity"
          style={{
            background: 'none',
            border: 'none',
            padding: 4,
            color: '#626f86',
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {/* Comments Tab */}
      {(activeTab === 'comments' || activeTab === 'all') && (
        <div>
          {/* Add Comment Input */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <Avatar name="hoc ng" size={32} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  border: '1px solid rgba(0,0,0,0.14)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <textarea
                  ref={commentInputRef}
                  rows={2}
                  placeholder="Add a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    color: '#172b4d',
                  }}
                />

                {/* Quick Prompts */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {commentPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        setCommentContent((prev) => (prev ? `${prev} ${prompt}` : prompt));
                        commentInputRef.current?.focus();
                      }}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#f1f2f4',
                        border: 'none',
                        borderRadius: 12,
                        fontSize: '0.75rem',
                        color: '#172b4d',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#091e421a')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Actions & Shortcut Hint */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 8,
                }}
              >
                <span style={{ fontSize: '0.75rem', color: '#626f86' }}>
                  Pro tip: press <kbd style={{ padding: '1px 4px', backgroundColor: '#f1f2f4', borderRadius: 3, border: '1px solid #dcdfe4' }}>M</kbd> to comment
                </span>

                <div style={{ display: 'flex', gap: 8 }}>
                  {commentContent.trim() && (
                    <Button size="sm" variant="ghost" onClick={() => setCommentContent('')}>
                      Cancel
                    </Button>
                  )}
                  <Button
                    size="sm"
                    disabled={!commentContent.trim()}
                    loading={isAddingComment}
                    onClick={handleSaveComment}
                  >
                    <Send size={13} />
                    <span>Save</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Comment List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
            {sortedComments.map((c) => (
              <div key={c.id} style={{ display: 'flex', gap: 12 }}>
                <Avatar name={c.author?.fullName || 'User'} src={c.author?.avatarUrl} size={30} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.84rem', color: '#172b4d' }}>
                      {c.author?.fullName || 'Anonymous'}
                    </span>
                    <span
                      title={formatDate(c.createdAt)}
                      style={{ fontSize: '0.75rem', color: '#626f86' }}
                    >
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#f7f8f9',
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: '0.875rem',
                      color: '#172b4d',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {renderTextWithIssueKeys(c.content || '', projectId)}
                  </div>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div style={{ color: '#626f86', fontSize: '0.8125rem', padding: '8px 0' }}>
                No comments yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {(activeTab === 'history' || activeTab === 'all') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map((h) => {
            const userName = h.changedBy?.fullName || 'Học Nguyễn';
            return (
              <div
                key={h.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: '#00875A',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {getUserInitials(userName)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>
                      {userName}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      {formatDate(h.changedAt)}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      flexWrap: 'wrap',
                    }}
                  >
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
                        letterSpacing: '0.02em',
                      }}
                    >
                      {h.field}
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>from</span>
                    {renderHistoryValueBadge(h.field, h.oldValue)}
                    <span style={{ color: 'var(--color-text-secondary)' }}>to</span>
                    {renderHistoryValueBadge(h.field, h.newValue)}
                  </div>
                </div>
              </div>
            );
          })}
          {history.length === 0 && (
            <p style={{ fontSize: '0.8125rem', color: '#626f86' }}>No activity recorded yet.</p>
          )}
        </div>
      )}

      {/* Worklog Tab */}
      {activeTab === 'worklog' && (
        <div style={{ color: '#626f86', fontSize: '0.8125rem', padding: '12px 0' }}>
          No work logged on this task.
        </div>
      )}
    </div>
  );
}
