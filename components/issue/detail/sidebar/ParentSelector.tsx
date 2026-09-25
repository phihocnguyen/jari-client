'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Check,
  Zap,
  Bookmark,
  AlertCircle,
  GitFork,
  CheckSquare,
  Plus,
} from 'lucide-react';
import type { Issue, IssueType } from '@/types/issue';
import { parentOptionStyle } from './sidebarUtils';

interface ParentSelectorProps {
  issue: Issue;
  issues: Issue[];
  onUpdateParent: (parentId: string | null) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** breadcrumb = "Add epic"; link (Details) = "Add parent" */
  variant?: 'link' | 'breadcrumb';
}

function issueTypeOf(issue: Issue): string {
  return (issue.type || issue.issueType || '').toUpperCase();
}

function TypeIcon({ type, size = 14 }: { type?: string; size?: number }) {
  switch ((type || '').toUpperCase()) {
    case 'EPIC':
      return <Zap size={size} color="#9333ea" fill="#9333ea" />;
    case 'STORY':
      return <Bookmark size={size} color="#16a34a" fill="#16a34a" />;
    case 'BUG':
      return <AlertCircle size={size} color="#dc2626" />;
    case 'SUBTASK':
      return <GitFork size={size} color="#0284c7" />;
    case 'TASK':
    default:
      return <CheckSquare size={size} color="#2563eb" />;
  }
}

/** Story/Task/Bug → Epic only. Subtask → Task/Story/Bug. */
function allowedParentTypesFor(issueType: string): string[] | null {
  if (issueType === 'EPIC') return null;
  if (issueType === 'SUBTASK') return ['TASK', 'STORY', 'BUG'];
  return ['EPIC'];
}

export function ParentSelector({
  issue,
  issues,
  onUpdateParent,
  open: controlledOpen,
  onOpenChange,
  variant = 'link',
}: ParentSelectorProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);

  const parentMenuOpen = controlledOpen ?? internalOpen;
  const setParentMenuOpen = (next: boolean | ((v: boolean) => boolean)) => {
    const value = typeof next === 'function' ? next(parentMenuOpen) : next;
    if (controlledOpen === undefined) setInternalOpen(value);
    onOpenChange?.(value);
    if (!value) setParentSearch('');
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (parentRef.current && !parentRef.current.contains(e.target as Node)) {
        setParentMenuOpen(false);
      }
    }
    if (parentMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [parentMenuOpen]);

  const issueType = issueTypeOf(issue);
  const allowedParentTypes = allowedParentTypesFor(issueType);

  if (!allowedParentTypes) {
    return <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>None (epics have no parent)</span>;
  }

  const isEpicOnly = allowedParentTypes.length === 1 && allowedParentTypes[0] === 'EPIC';
  // Details sidebar keeps "Add parent"; breadcrumb uses "Add epic" for story/task/bug
  const emptyLabel =
    variant === 'breadcrumb' && isEpicOnly ? 'Add epic' : 'Add parent';
  const removeLabel = isEpicOnly ? 'None (remove epic)' : 'None (remove parent)';
  const searchPlaceholder = isEpicOnly ? 'Search epics…' : 'Search issues…';
  const emptyMessage = isEpicOnly ? 'No epics found.' : 'No eligible parent issues found.';

  const parentIssue = issues.find((it) => it.id === issue.parentId);

  const parentCandidates = issues.filter((it) => {
    const t = issueTypeOf(it);
    return (
      it.id !== issue.id &&
      it.parentId !== issue.id &&
      allowedParentTypes.includes(t) &&
      (`${it.key || ''} ${it.title || ''}`).toLowerCase().includes(parentSearch.toLowerCase())
    );
  });

  const triggerStyle: React.CSSProperties =
    variant === 'breadcrumb'
      ? {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: 'none',
          border: 'none',
          color: '#626f86',
          fontSize: '0.8125rem',
          cursor: 'pointer',
          padding: '2px 6px',
          borderRadius: 4,
          textAlign: 'left',
        }
      : {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: '#0c66e4',
          fontSize: '0.8125rem',
          cursor: 'pointer',
          padding: '2px 4px',
          borderRadius: 4,
          textAlign: 'left',
        };

  return (
    <div ref={parentRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setParentMenuOpen((v) => !v)}
        style={triggerStyle}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {parentIssue ? (
          <>
            <TypeIcon type={issueTypeOf(parentIssue)} size={14} />
            <span>
              {parentIssue.key} {parentIssue.title}
            </span>
          </>
        ) : (
          <>
            {variant === 'breadcrumb' && <Plus size={13} />}
            <span>{emptyLabel}</span>
          </>
        )}
      </button>

      {parentMenuOpen && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: 300,
            top: '100%',
            marginTop: 4,
            backgroundColor: '#ffffff',
            borderRadius: 6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
            border: '1px solid rgba(0,0,0,0.12)',
            zIndex: 200,
          }}
        >
          <div style={{ padding: 8, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 8px',
                backgroundColor: '#f1f2f4',
                borderRadius: 4,
              }}
            >
              <Search size={13} color="#626f86" />
              <input
                autoFocus
                value={parentSearch}
                onChange={(e) => setParentSearch(e.target.value)}
                placeholder={searchPlaceholder}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.8125rem',
                  color: '#172b4d',
                }}
              />
            </div>
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto', padding: '4px 0' }}>
            {parentIssue && (
              <button
                type="button"
                onClick={() => {
                  onUpdateParent(null);
                  setParentMenuOpen(false);
                }}
                style={parentOptionStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ color: '#626f86' }}>{removeLabel}</span>
              </button>
            )}
            {parentCandidates.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => {
                  onUpdateParent(it.id);
                  setParentMenuOpen(false);
                }}
                style={{ ...parentOptionStyle, gap: 8 }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <TypeIcon type={issueTypeOf(it) as IssueType} size={14} />
                <span style={{ color: '#626f86', flexShrink: 0 }}>{it.key}</span>
                <span
                  style={{
                    color: '#172b4d',
                    flex: 1,
                    textAlign: 'left',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {it.title}
                </span>
                {issue.parentId === it.id && <Check size={13} color="#0c66e4" />}
              </button>
            ))}
            {parentCandidates.length === 0 && !parentIssue && (
              <div style={{ padding: '8px 12px', color: '#626f86', fontSize: '0.8125rem' }}>
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
