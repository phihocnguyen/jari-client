'use client';

import React from 'react';
import { Trash2, X } from 'lucide-react';

interface IssueListBulkBarProps {
  selectedCount: number;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  isDeleting?: boolean;
}

export function IssueListBulkBar({
  selectedCount,
  onDeleteSelected,
  onClearSelection,
  isDeleting = false,
}: IssueListBulkBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '10px 18px',
        backgroundColor: '#172b4d',
        color: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(9, 30, 66, 0.28)',
        fontSize: '0.875rem',
        fontWeight: 500,
        animation: 'fadeInUp 0.2s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            padding: '2px 8px',
            fontSize: '0.8125rem',
            fontWeight: 700,
          }}
        >
          {selectedCount}
        </span>
        <span>{selectedCount === 1 ? 'issue selected' : 'issues selected'}</span>
      </div>

      <div style={{ height: '18px', width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }} />

      <button
        type="button"
        onClick={onDeleteSelected}
        disabled={isDeleting}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          backgroundColor: '#dc2626',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: isDeleting ? 'not-allowed' : 'pointer',
          opacity: isDeleting ? 0.7 : 1,
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
      >
        <Trash2 size={14} />
        <span>Delete selected</span>
      </button>

      <button
        type="button"
        onClick={onClearSelection}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.75)',
          cursor: 'pointer',
          padding: '4px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
        }}
        title="Deselect all"
        onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)')}
      >
        <X size={16} />
      </button>
    </div>
  );
}
