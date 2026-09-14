'use client';

import { ReactNode } from 'react';

// ─── Empty State Component ────────────────────────────────────────
interface EmptyStateProps {
  icon?:        ReactNode;
  title:        string;
  description?: string;
  action?:      ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '3rem 1.5rem',
        gap: '0.75rem',
      }}
    >
      {icon && (
        <div style={{
          width: 64, height: 64,
          borderRadius: '50%',
          background: 'var(--color-canvas-cool)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '0.5rem',
          color: 'var(--color-text-secondary)',
        }}>
          {icon}
        </div>
      )}
      <h3 style={{
        fontSize: '1.0625rem', fontWeight: 600,
        color: 'var(--color-text-primary)',
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--color-text-secondary)',
          maxWidth: 380, lineHeight: 1.6,
        }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
}
