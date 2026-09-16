'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface MoveWorkItemsModalProps {
  open: boolean;
  issueKey: string;
  sourceSprintName: string;
  targetSprintName: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function MoveWorkItemsModal({
  open,
  issueKey,
  sourceSprintName,
  targetSprintName,
  onClose,
  onConfirm,
  loading = false,
}: MoveWorkItemsModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 30, 66, 0.54)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          padding: '24px 24px 20px',
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 8px 30px rgba(9, 30, 66, 0.25)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          animation: 'slideUp 0.18s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with AlertTriangle Icon & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <AlertTriangle size={24} color="#E26D00" fill="#FFAB00" style={{ flexShrink: 0 }} />
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#172B4D',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Move work items
          </h3>
        </div>

        {/* Body message matching exact Jira format */}
        <div style={{ fontSize: '0.875rem', color: '#172B4D', lineHeight: 1.5, marginBottom: 24 }}>
          <p style={{ margin: '0 0 16px', color: '#172B4D' }}>
            Sprint scope will be affected by this action.
          </p>
          <p style={{ margin: 0, color: '#172B4D' }}>
            <strong>{issueKey}</strong> will be moved from sprint <strong>{sourceSprintName}</strong> to sprint{' '}
            <strong>{targetSprintName}</strong>.
          </p>
        </div>

        {/* Footer Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              height: 36,
              padding: '0 14px',
              borderRadius: 4,
              border: 'none',
              backgroundColor: 'transparent',
              color: '#42526E',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EBECF0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              height: 36,
              padding: '0 18px',
              borderRadius: 4,
              border: 'none',
              backgroundColor: '#0052CC',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 0.15s',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#0747A6';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#0052CC';
            }}
          >
            {loading ? 'Moving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
