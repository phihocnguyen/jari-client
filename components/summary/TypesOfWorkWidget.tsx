'use client';

import { CheckSquare, Bookmark, Zap, AlertCircle } from 'lucide-react';
import type { TypeCount } from '@/types/summary';

interface TypesOfWorkWidgetProps {
  typeBreakdown?: TypeCount[];
  isLoading?: boolean;
}

const TYPE_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  TASK: { icon: <CheckSquare size={16} color="#2563EB" />, color: '#2563EB' },
  STORY: { icon: <Bookmark size={16} color="#16A34A" />, color: '#16A34A' },
  BUG: { icon: <AlertCircle size={16} color="#E11D48" />, color: '#E11D48' },
  EPIC: { icon: <Zap size={16} color="#9333EA" />, color: '#9333EA' },
  SUBTASK: { icon: <Bookmark size={16} color="#0284C7" />, color: '#0284C7' },
  SUB_TASK: { icon: <Bookmark size={16} color="#0284C7" />, color: '#0284C7' },
};

function formatTypeLabel(type: string): string {
  if (type === 'SUB_TASK' || type === 'SUBTASK') return 'Sub-task';
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

// ─── Types Of Work Widget ───────────────────────────────────────────
export function TypesOfWorkWidget({ typeBreakdown, isLoading }: TypesOfWorkWidgetProps) {
  const total = (typeBreakdown ?? []).reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="card" style={{ padding: '1.5rem', height: '380px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ marginBottom: 4 }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Types of work</h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
          Get a breakdown of issues by their types.
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 90, height: 18, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4 }} />
                <div style={{ flex: 1, height: 18, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        ) : !typeBreakdown || typeBreakdown.length === 0 ? (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            No issues found in this project.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {typeBreakdown.map((item) => {
              const normalizedKey = item.type.toUpperCase();
              const meta = TYPE_ICONS[normalizedKey] || {
                icon: <CheckSquare size={16} color="#64748B" />,
                color: '#64748B',
              };
              const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;

              return (
                <TypeProgressRow
                  key={item.type}
                  icon={meta.icon}
                  label={formatTypeLabel(item.type)}
                  percent={percent}
                  count={item.count}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TypeProgressRow({
  icon,
  label,
  percent,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  percent: number;
  count: number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: 100,
          flexShrink: 0,
          fontSize: '0.8125rem',
          fontWeight: 500,
        }}
      >
        {icon}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      </div>
      <div
        style={{
          flex: 1,
          height: 18,
          backgroundColor: 'rgba(0,0,0,0.06)',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${Math.max(percent, 2)}%`,
            height: '100%',
            backgroundColor: '#64748B',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 8,
            transition: 'width 0.4s ease',
          }}
        >
          {percent > 5 && (
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>{percent}%</span>
          )}
        </div>
      </div>
      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', minWidth: 35, textAlign: 'right' }}>
        {count}
      </span>
    </div>
  );
}

