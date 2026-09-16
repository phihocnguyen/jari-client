'use client';

import { Ban, ChevronsUp, ArrowUp, Minus, ArrowDown } from 'lucide-react';
import type { PriorityCount } from '@/types/summary';

const PRIORITY_META: Record<string, { icon: React.ReactNode; color: string }> = {
  BLOCKED:  { icon: <Ban size={13} color="#DC2626" />, color: '#DC2626' },
  HIGHEST:  { icon: <ChevronsUp size={13} color="#DC2626" />, color: '#DC2626' },
  HIGH:     { icon: <ArrowUp size={13} color="#EA580C" />, color: '#EA580C' },
  MEDIUM:   { icon: <Minus size={13} color="#D97706" />, color: '#D97706' },
  LOW:      { icon: <ArrowDown size={13} color="#2563EB" />, color: '#2563EB' },
  LOWEST:   { icon: <ArrowDown size={13} color="#0284C7" />, color: '#0284C7' },
};

interface PriorityBreakdownWidgetProps {
  priorityBreakdown?: PriorityCount[];
  isLoading?: boolean;
}

export function PriorityBreakdownWidget({ priorityBreakdown, isLoading }: PriorityBreakdownWidgetProps) {
  const items = priorityBreakdown ?? [];
  const maxCount = items.reduce((m, i) => Math.max(m, i.count), 1);

  return (
    <div className="card" style={{ padding: '1.5rem', height: '380px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ marginBottom: 4 }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Priority breakdown</h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
          Get a holistic view of how work is being prioritized.
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {isLoading || items.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem 0', fontSize: '0.875rem' }}>
            {isLoading ? 'Loading...' : 'No data yet.'}
          </div>
        ) : (
          <div style={{ backgroundColor: '#FAF9F6', borderRadius: 12, padding: '1.25rem 1rem 0.75rem' }}>
            {/* Bar Chart */}
            <div style={{ display: 'flex', height: 160, alignItems: 'flex-end', justifyContent: 'space-around', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              {items.map((item) => {
                const pct = (item.count / maxCount) * 100;
                const meta = PRIORITY_META[item.priority.toUpperCase()] ?? { color: '#64748B' };
                return (
                  <div key={item.priority} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end', width: 44 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>{item.count}</span>
                    <div style={{ width: 28, height: `${Math.max(pct, 4)}%`, backgroundColor: meta.color, borderRadius: '4px 4px 0 0', transition: 'height 0.4s ease' }} />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: 8 }}>
              {items.map((item) => {
                const meta = PRIORITY_META[item.priority.toUpperCase()];
                return (
                  <div key={item.priority} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', color: 'var(--color-text-secondary)', width: 44, justifyContent: 'center' }}>
                    {meta?.icon}
                    <span>{item.priority.charAt(0) + item.priority.slice(1).toLowerCase()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

