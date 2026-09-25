'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { getStatusBadgeStyle } from '@/utils/issue-status';
import type { IssueStatus } from '@/types/issue';

interface TaskStatusActionsProps {
  status: IssueStatus;
  viewMode: 'modal' | 'right-bar' | 'full-page';
  onUpdateStatus: (status: IssueStatus) => void;
}

export function TaskStatusActions({
  status,
  viewMode,
  onUpdateStatus,
}: TaskStatusActionsProps) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusMenuOpen(false);
      }
    }
    if (statusMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [statusMenuOpen]);

  if (viewMode !== 'modal' && viewMode !== 'full-page') {
    return null;
  }

  const statusBadge = getStatusBadgeStyle(status);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div ref={statusRef} style={{ position: 'relative', flex: 1 }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setStatusMenuOpen((v) => !v);
          }}
          style={{
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 12px',
            backgroundColor: statusBadge.bg,
            color: statusBadge.color,
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
              left: 0,
              right: 0,
              top: '100%',
              marginTop: 4,
              backgroundColor: '#ffffff',
              borderRadius: 6,
              boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
              border: '1px solid rgba(0,0,0,0.12)',
              padding: '4px 0',
              zIndex: 100,
            }}
          >
            {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as IssueStatus[]).map((st) => {
              const badge = getStatusBadgeStyle(st);
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
                    color: badge.color,
                    fontWeight: status === st ? 600 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span>{badge.label}</span>
                  {status === st && <Check size={14} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
