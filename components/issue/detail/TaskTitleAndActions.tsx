'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  MoreHorizontal,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Issue, IssueStatus } from '@/types/issue';

interface TaskTitleAndActionsProps {
  issue: Issue;
  viewMode: 'modal' | 'right-bar';
  onUpdateTitle: (newTitle: string) => void;
  isUpdatingTitle: boolean;
  onOpenAddSubtask: () => void;
  onOpenAiAssistant: () => void;
  onUpdateStatus: (status: IssueStatus) => void;
}

export function TaskTitleAndActions({
  issue,
  viewMode,
  onUpdateTitle,
  isUpdatingTitle,
  onOpenAddSubtask,
  onOpenAiAssistant,
  onUpdateStatus,
}: TaskTitleAndActionsProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(issue.title || '');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  useEffect(() => {
    setTitleValue(issue.title || '');
  }, [issue.title]);

  const handleSave = () => {
    if (titleValue.trim() && titleValue !== issue.title) {
      onUpdateTitle(titleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const getStatusBadgeProps = (status?: IssueStatus) => {
    switch (status) {
      case 'DONE':
        return { label: 'Done', bg: '#e3fcef', text: '#006644' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', bg: '#e9f2ff', text: '#0052cc' };
      case 'IN_REVIEW':
        return { label: 'In Review', bg: '#eae6ff', text: '#403294' };
      case 'TODO':
      default:
        return { label: 'To Do', bg: '#f1f2f4', text: '#44546f' };
    }
  };

  const statusBadge = getStatusBadgeProps(issue.status);

  return (
    <div>
      {/* Editable Title */}
      {isEditingTitle ? (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              fontSize: '1.25rem',
              fontWeight: 600,
              padding: '6px 10px',
              border: '2px solid #0c66e4',
              borderRadius: 4,
              outline: 'none',
              color: '#172b4d',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setIsEditingTitle(false);
            }}
          />
          <Button size="sm" onClick={handleSave} loading={isUpdatingTitle}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <h1
          onClick={() => setIsEditingTitle(true)}
          title="Click to edit title"
          style={{
            fontSize: viewMode === 'modal' ? '1.5rem' : '1.35rem',
            fontWeight: 600,
            lineHeight: 1.25,
            color: '#172b4d',
            marginBottom: 12,
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: 4,
            display: 'inline-block',
            width: '100%',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {issue.title}
        </h1>
      )}

      {/* Toolbar under Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <button
          type="button"
          onClick={onOpenAddSubtask}
          title="Add child issue or subtask"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            backgroundColor: '#f1f2f4',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            color: '#44546f',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#091e4224')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
        >
          <Plus size={16} />
        </button>

        <button
          type="button"
          title="More actions"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            backgroundColor: '#f1f2f4',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            color: '#44546f',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#091e4224')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
        >
          <MoreHorizontal size={16} />
        </button>

        <button
          type="button"
          title="View settings"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            backgroundColor: '#f1f2f4',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            color: '#44546f',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#091e4224')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
        >
          <SlidersHorizontal size={15} />
        </button>

        {/* Right-Bar Mode: status & improve task inline */}
        {viewMode === 'right-bar' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  backgroundColor: statusBadge.bg,
                  color: statusBadge.text,
                  border: 'none',
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                <span>{statusBadge.label}</span>
                <ChevronDown size={14} />
              </button>

              {statusMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: 4,
                    backgroundColor: '#ffffff',
                    borderRadius: 6,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    padding: '4px 0',
                    minWidth: 140,
                    zIndex: 30,
                  }}
                >
                  {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as IssueStatus[]).map((st) => {
                    const badge = getStatusBadgeProps(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          onUpdateStatus(st);
                          setStatusMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                          color: badge.text,
                          fontWeight: issue.status === st ? 600 : 500,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <span>{badge.label}</span>
                        {issue.status === st && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenAiAssistant}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                backgroundColor: '#f1f2f4',
                color: '#172b4d',
                border: 'none',
                borderRadius: 4,
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#091e4224')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
            >
              <Sparkles size={14} color="#0c66e4" />
              <span>Improve Task</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
