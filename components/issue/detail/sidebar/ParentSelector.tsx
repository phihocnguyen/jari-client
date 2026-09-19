'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Check } from 'lucide-react';
import type { Issue } from '@/types/issue';
import { parentOptionStyle } from './sidebarUtils';

interface ParentSelectorProps {
  issue: Issue;
  issues: Issue[];
  onUpdateParent: (parentId: string | null) => void;
}

export function ParentSelector({ issue, issues, onUpdateParent }: ParentSelectorProps) {
  const [parentMenuOpen, setParentMenuOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (parentRef.current && !parentRef.current.contains(e.target as Node)) {
        setParentMenuOpen(false);
        setParentSearch('');
      }
    }
    if (parentMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [parentMenuOpen]);

  const issueType = (issue.type || '').toUpperCase();
  if (issueType === 'EPIC') {
    return <span style={{ color: '#626f86', fontSize: '0.8125rem' }}>None (epics have no parent)</span>;
  }

  const allowedParentTypes =
    issueType === 'SUBTASK' ? ['TASK', 'STORY', 'BUG'] : ['EPIC', 'TASK', 'STORY', 'BUG'];

  const parentIssue = issues.find((it) => it.id === issue.parentId);
  const parentCandidates = issues.filter(
    (it) =>
      it.id !== issue.id &&
      it.parentId !== issue.id &&
      allowedParentTypes.includes((it.type || '').toUpperCase()) &&
      it.title.toLowerCase().includes(parentSearch.toLowerCase())
  );

  return (
    <div ref={parentRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setParentMenuOpen((v) => !v)}
        style={{
          background: 'none',
          border: 'none',
          color: '#0c66e4',
          fontSize: '0.8125rem',
          cursor: 'pointer',
          padding: '2px 4px',
          borderRadius: 4,
          textAlign: 'left',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {parentIssue ? `${parentIssue.key} ${parentIssue.title}` : 'Add parent'}
      </button>

      {parentMenuOpen && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: 260,
            top: '100%',
            marginTop: 4,
            backgroundColor: '#ffffff',
            borderRadius: 6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
            border: '1px solid rgba(0,0,0,0.12)',
            zIndex: 100,
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
                placeholder="Search issues..."
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
                <span style={{ color: '#626f86' }}>None (remove parent)</span>
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
                style={parentOptionStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ color: '#626f86', marginRight: 6 }}>{it.key}</span>
                <span style={{ color: '#172b4d', flex: 1, textAlign: 'left' }}>{it.title}</span>
                {issue.parentId === it.id && <Check size={13} color="#0c66e4" />}
              </button>
            ))}
            {parentCandidates.length === 0 && !parentIssue && (
              <div style={{ padding: '8px 12px', color: '#626f86', fontSize: '0.8125rem' }}>
                No eligible parent issues found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
