'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, SlidersHorizontal } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { Comment, IssueHistory } from '@/types/issue';

interface TaskActivityProps {
  comments: Comment[];
  history: IssueHistory[];
  onAddComment: (content: string) => void;
  isAddingComment: boolean;
}

export function TaskActivity({
  comments,
  history,
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
            {comments.map((c) => (
              <div key={c.id} style={{ display: 'flex', gap: 12 }}>
                <Avatar name={c.author?.fullName || 'User'} src={c.author?.avatarUrl} size={30} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.84rem', color: '#172b4d' }}>
                      {c.author?.fullName || 'Anonymous'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#626f86' }}>
                      {new Date(c.createdAt).toLocaleDateString()} at{' '}
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    {c.content}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {history.map((h) => (
            <div
              key={h.id}
              style={{
                fontSize: '0.8125rem',
                color: '#44546f',
                padding: '6px 0',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <strong>{h.changedBy?.fullName || 'User'}</strong> updated <strong>{h.field}</strong> from{' '}
              <em>{h.oldValue || 'none'}</em> to <em>{h.newValue || 'none'}</em>
            </div>
          ))}
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
