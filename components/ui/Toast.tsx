'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  message?: string;
  duration?: number;
  action?: ToastAction;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
  action?: ToastAction;
}

// ─── Event Emitter & Global API ───────────────────────────────────
type ToastListener = (toasts: ToastItem[]) => void;
let listeners: ToastListener[] = [];
let toasts: ToastItem[] = [];
let counter = 0;

function notify() {
  listeners.forEach((fn) => fn([...toasts]));
}

export const toast = {
  show: (type: ToastType, title: string, messageOrOptions?: string | ToastOptions) => {
    const id = `toast-${++counter}-${Date.now()}`;
    let message: string | undefined;
    let duration = 4500;
    let action: ToastAction | undefined;

    if (typeof messageOrOptions === 'string') {
      message = messageOrOptions;
    } else if (messageOrOptions) {
      message = messageOrOptions.message;
      if (messageOrOptions.duration !== undefined) duration = messageOrOptions.duration;
      action = messageOrOptions.action;
    }

    const newToast: ToastItem = {
      id,
      type,
      title,
      message,
      duration,
      action,
    };

    // Limit maximum stacked toasts to 4
    if (toasts.length >= 4) {
      toasts = toasts.slice(toasts.length - 3);
    }

    toasts = [...toasts, newToast];
    notify();
    return id;
  },
  success: (title: string, messageOrOptions?: string | ToastOptions) =>
    toast.show('success', title, messageOrOptions),
  error: (title: string, messageOrOptions?: string | ToastOptions) =>
    toast.show('error', title, messageOrOptions),
  warning: (title: string, messageOrOptions?: string | ToastOptions) =>
    toast.show('warning', title, messageOrOptions),
  info: (title: string, messageOrOptions?: string | ToastOptions) =>
    toast.show('info', title, messageOrOptions),
  dismiss: (id?: string) => {
    if (id) {
      toasts = toasts.filter((t) => t.id !== id);
    } else {
      toasts = [];
    }
    notify();
  },
};

// ─── Visual Theme Configuration ───────────────────────────────────
const THEMES: Record<
  ToastType,
  {
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    iconColor: string;
    badgeBg: string;
    badgeBorder: string;
    accentBar: string;
    progressGradient: string;
    cardBorder: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconColor: '#00754A', // Jari brand green
    badgeBg: 'rgba(0, 117, 74, 0.09)',
    badgeBorder: 'rgba(0, 117, 74, 0.22)',
    accentBar: '#00754A',
    progressGradient: 'linear-gradient(90deg, #00754A, #10b981)',
    cardBorder: 'rgba(0, 117, 74, 0.16)',
  },
  error: {
    icon: AlertCircle,
    iconColor: '#dc2626',
    badgeBg: 'rgba(220, 38, 38, 0.08)',
    badgeBorder: 'rgba(220, 38, 38, 0.22)',
    accentBar: '#dc2626',
    progressGradient: 'linear-gradient(90deg, #dc2626, #f87171)',
    cardBorder: 'rgba(220, 38, 38, 0.18)',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: '#d97706',
    badgeBg: 'rgba(217, 119, 6, 0.09)',
    badgeBorder: 'rgba(217, 119, 6, 0.24)',
    accentBar: '#d97706',
    progressGradient: 'linear-gradient(90deg, #d97706, #fbbf24)',
    cardBorder: 'rgba(217, 119, 6, 0.18)',
  },
  info: {
    icon: Info,
    iconColor: '#2563eb',
    badgeBg: 'rgba(37, 99, 235, 0.08)',
    badgeBorder: 'rgba(37, 99, 235, 0.22)',
    accentBar: '#2563eb',
    progressGradient: 'linear-gradient(90deg, #2563eb, #60a5fa)',
    cardBorder: 'rgba(37, 99, 235, 0.16)',
  },
};

// ─── Individual Toast Card Component ──────────────────────────────
function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progressWidth, setProgressWidth] = useState(100);

  const duration = item.duration || 4500;
  const remainingTimeRef = useRef(duration);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const theme = THEMES[item.type];
  const IconComponent = theme.icon;

  const triggerDismiss = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(item.id);
    }, 220);
  }, [isExiting, item.id, onDismiss]);

  // Handle countdown & progress bar with pause on hover
  useEffect(() => {
    if (isExiting) return;

    if (!isPaused) {
      startTimeRef.current = Date.now();
      const currentRemaining = remainingTimeRef.current;

      timerRef.current = setTimeout(() => {
        triggerDismiss();
      }, currentRemaining);

      const updateProgress = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const left = Math.max(0, currentRemaining - elapsed);
        const percent = (left / duration) * 100;
        setProgressWidth(percent);

        if (left > 0 && !isPaused) {
          animFrameRef.current = requestAnimationFrame(updateProgress);
        }
      };

      animFrameRef.current = requestAnimationFrame(updateProgress);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPaused, isExiting, duration, triggerDismiss]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        padding: '0.875rem 1rem 1rem 1.15rem',
        minWidth: '320px',
        maxWidth: '400px',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderRadius: '14px',
        border: `1px solid ${theme.cardBorder}`,
        boxShadow:
          '0 12px 32px -4px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        pointerEvents: 'auto',
        userSelect: 'none',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        transform: isExiting
          ? 'translateY(12px) scale(0.95)'
          : isPaused
          ? 'translateY(-2px)'
          : 'translateY(0)',
        opacity: isExiting ? 0 : 1,
        animation: isExiting
          ? 'toastSlideOut 0.22s cubic-bezier(0.4, 0, 1, 1) forwards'
          : 'toastSlideIn 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Left accent bar indicator */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          bottom: '12px',
          left: '0px',
          width: '4px',
          borderRadius: '0 4px 4px 0',
          backgroundColor: theme.accentBar,
        }}
      />

      {/* Styled Icon Badge */}
      <div
        style={{
          flexShrink: 0,
          width: '34px',
          height: '34px',
          borderRadius: '10px',
          backgroundColor: theme.badgeBg,
          border: `1px solid ${theme.badgeBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '1px',
          color: theme.iconColor,
        }}
      >
        <IconComponent size={19} strokeWidth={2.2} />
      </div>

      {/* Body: Title + Message + Optional Action */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: '1px' }}>
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#111827',
            letterSpacing: '-0.01em',
            lineHeight: 1.35,
          }}
        >
          {item.title}
        </div>

        {item.message && (
          <div
            style={{
              fontSize: '0.8125rem',
              color: '#4b5563',
              marginTop: '3px',
              lineHeight: 1.45,
              wordBreak: 'break-word',
            }}
          >
            {item.message}
          </div>
        )}

        {item.action && (
          <button
            onClick={() => {
              item.action?.onClick();
              triggerDismiss();
            }}
            style={{
              marginTop: '0.5rem',
              padding: '3px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: theme.iconColor,
              backgroundColor: theme.badgeBg,
              border: `1px solid ${theme.badgeBorder}`,
              borderRadius: '9999px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(0.95)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'none';
            }}
          >
            {item.action.label}
          </button>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        onClick={triggerDismiss}
        style={{
          flexShrink: 0,
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          border: 'none',
          background: 'transparent',
          color: '#9ca3af',
          cursor: 'pointer',
          padding: 0,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)';
          e.currentTarget.style.color = '#374151';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#9ca3af';
        }}
        aria-label="Dismiss toast"
      >
        <X size={14} strokeWidth={2.2} />
      </button>

      {/* Bottom Progress Countdown Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '2.5px',
          width: `${progressWidth}%`,
          background: theme.progressGradient,
          transition: isPaused ? 'none' : 'width 0.05s linear',
          opacity: 0.85,
        }}
      />
    </div>
  );
}

// ─── Global Toast Container ───────────────────────────────────────
export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener: ToastListener = (newToasts) => setItems(newToasts);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const handleDismiss = useCallback((id: string) => {
    toast.dismiss(id);
  }, []);

  if (items.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.95);
          }
          65% {
            opacity: 1;
            transform: translateY(-2px) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes toastSlideOut {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
        }
      `}</style>
      <div
        role="region"
        aria-label="Notifications"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          pointerEvents: 'none',
        }}
      >
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={handleDismiss} />
        ))}
      </div>
    </>
  );
}
