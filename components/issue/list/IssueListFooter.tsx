'use client';

import React from 'react';
import { Plus, RotateCw } from 'lucide-react';

interface IssueListFooterProps {
  totalCount: number;
  filteredCount: number;
  onCreateClick: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function IssueListFooter({
  totalCount,
  filteredCount,
  onCreateClick,
  onRefresh,
  isRefreshing = false,
}: IssueListFooterProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        fontSize: '0.84rem',
        userSelect: 'none',
      }}
    >
      {/* 1. Left: + Create button */}
      <div>
        <button
          type="button"
          onClick={onCreateClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: 'var(--color-text-primary)',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 4,
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Plus size={16} />
          <span>Create</span>
        </button>
      </div>

      {/* 2. Center: Count + Refresh Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: 'var(--color-text-secondary)',
          fontSize: '0.8125rem',
          fontWeight: 500,
        }}
      >
        <span>
          {filteredCount} of {totalCount}
        </span>

        <button
          type="button"
          onClick={onRefresh}
          title="Refresh list"
          style={{
            background: 'none',
            border: 'none',
            padding: 4,
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-secondary)',
            transition: 'all 0.2s ease',
            transform: isRefreshing ? 'rotate(180deg)' : 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
        >
          <RotateCw size={14} />
        </button>
      </div>

      {/* 3. Right: Spacer for balancing layout */}
      <div style={{ width: 80 }} />
    </div>
  );
}
