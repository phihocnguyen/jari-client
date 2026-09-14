'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Toast System ─────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id:      string;
  type:    ToastType;
  title:   string;
  message?: string;
}

// Simple event emitter for toasts
type ToastListener = (toasts: Toast[]) => void;
let listeners: ToastListener[] = [];
let toasts: Toast[] = [];

function notify() { listeners.forEach(fn => fn([...toasts])); }

let counter = 0;
export const toast = {
  show: (type: ToastType, title: string, message?: string) => {
    const id = `toast-${++counter}`;
    toasts = [...toasts, { id, type, title, message }];
    notify();
    setTimeout(() => toast.dismiss(id), 5000);
  },
  success: (title: string, message?: string) => toast.show('success', title, message),
  error:   (title: string, message?: string) => toast.show('error',   title, message),
  warning: (title: string, message?: string) => toast.show('warning', title, message),
  info:    (title: string, message?: string) => toast.show('info',    title, message),
  dismiss: (id: string) => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  },
};

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  error:   <XCircle     size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info         size={18} />,
};

const COLORS: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: { bg: 'var(--color-surface-white)', icon: 'var(--color-green-accent)', border: 'var(--color-green-light)' },
  error:   { bg: 'var(--color-surface-white)', icon: 'var(--color-red)',          border: '#fecaca' },
  warning: { bg: 'var(--color-surface-white)', icon: '#d97706',                   border: '#fef3c7' },
  info:    { bg: 'var(--color-surface-white)', icon: '#2563eb',                   border: '#bfdbfe' },
};

// ─── ToastContainer ───────────────────────────────────────────────
export function ToastContainer() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const listener: ToastListener = (t) => setItems(t);
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem',
        pointerEvents: 'none',
      }}
    >
      {items.map(item => {
        const c = COLORS[item.type];
        return (
          <div
            key={item.id}
            className="animate-slide-in"
            style={{
              background: c.bg, border: `1px solid ${c.border}`,
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--shadow-modal)',
              padding: '0.875rem 1rem',
              maxWidth: 360, minWidth: 280,
              display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              pointerEvents: 'all',
            }}
          >
            <span style={{ color: c.icon, marginTop: 1, flexShrink: 0 }}>{ICONS[item.type]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{item.title}</div>
              {item.message && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{item.message}</div>
              )}
            </div>
            <button
              onClick={() => toast.dismiss(item.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-secondary)', padding: 0, flexShrink: 0,
                display: 'flex', alignItems: 'center',
              }}
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
