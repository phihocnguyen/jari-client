'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';

// ─── Modal Component ──────────────────────────────────────────────
interface ModalProps {
  open:     boolean;
  onClose:  () => void;
  title?:   string;
  children: ReactNode;
  footer?:  ReactNode;
  size?:    'sm' | 'md' | 'lg' | 'xl';
}

const sizeWidth: Record<string, string> = {
  sm: '400px',
  md: '560px',
  lg: '720px',
  xl: '900px',
};

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          background: 'var(--color-surface-white)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-modal)',
          width: '100%',
          maxWidth: sizeWidth[size],
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        className="animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-full)',
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'var(--transition-fast)',
              }}
              aria-label="Close modal"
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(0,0,0,0.08)',
            display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
