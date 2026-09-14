'use client';

// ─── Badge Component ──────────────────────────────────────────────
type BadgeVariant = 'green' | 'gold' | 'red' | 'blue' | 'gray' | 'orange' | 'purple';

interface BadgeProps {
  children:   React.ReactNode;
  variant?:   BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}

// ─── Issue Status Badge ───────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  TODO:        { label: 'To Do',       variant: 'gray'   },
  IN_PROGRESS: { label: 'In Progress', variant: 'blue'   },
  IN_REVIEW:   { label: 'In Review',   variant: 'orange' },
  DONE:        { label: 'Done',        variant: 'green'  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'gray' as BadgeVariant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// ─── Issue Priority Badge ─────────────────────────────────────────
const PRIORITY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  HIGHEST: { label: 'Highest', color: '#c82014', icon: '⬆⬆' },
  HIGH:    { label: 'High',    color: '#e85c33', icon: '⬆'  },
  MEDIUM:  { label: 'Medium',  color: '#fbbc05', icon: '➡'  },
  LOW:     { label: 'Low',     color: '#2563eb', icon: '⬇'  },
  LOWEST:  { label: 'Lowest',  color: '#6b7280', icon: '⬇⬇' },
};

export function PriorityBadge({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIG[priority] ?? { label: priority, color: '#6b7280', icon: '·' };
  return (
    <span
      title={config.label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: '0.75rem', fontWeight: 600,
        color: config.color,
      }}
    >
      <span style={{ fontSize: '0.7rem' }}>{config.icon}</span>
      {config.label}
    </span>
  );
}

// ─── Issue Type Badge ─────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  EPIC:    { label: 'Epic',    color: '#7e22ce', icon: '⚡' },
  STORY:   { label: 'Story',   color: '#059669', icon: '📖' },
  TASK:    { label: 'Task',    color: '#2563eb', icon: '✓'  },
  BUG:     { label: 'Bug',     color: '#c82014', icon: '🐛' },
  SUBTASK: { label: 'Subtask', color: '#6b7280', icon: '↳'  },
};

export function TypeBadge({ type }: { type: string }) {
  const config = TYPE_CONFIG[type] ?? { label: type, color: '#6b7280', icon: '?' };
  return (
    <span
      title={config.label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: '0.75rem', fontWeight: 600,
        color: config.color,
      }}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
