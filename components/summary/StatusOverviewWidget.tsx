'use client';

import Link from 'next/link';
import type { StatusCount } from '@/types/summary';

// Semantic colors for common Jira status categories
const KNOWN_STATUS_COLORS: Record<string, string> = {
  'TO DO': '#0284C7',
  'TODO': '#0284C7',
  'IN PROGRESS': '#2563EB',
  'IN REVIEW': '#7C3AED',
  'DONE': '#22C55E',
  'CANCELLED': '#94A3B8',
};

const DEFAULT_STATUS_COLORS = ['#0284C7', '#2563EB', '#7C3AED', '#EA580C', '#DB2777', '#1E3A8A', '#94A3B8', '#22C55E'];

export function formatStatusLabel(status: string): string {
  if (!status) return '';
  const upper = status.trim().toUpperCase();
  if (upper === 'TO DO' || upper === 'TODO') return 'To Do';
  if (upper === 'DONE') return 'Done';
  if (upper === 'IN PROGRESS') return 'In progress';
  if (upper === 'IN REVIEW') return 'In review';
  if (upper === 'CANCELLED') return 'Cancelled';
  return status
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface StatusOverviewWidgetProps {
  projectId: string;
  statusBreakdown?: StatusCount[];
  isLoading?: boolean;
}

export function StatusOverviewWidget({ projectId, statusBreakdown, isLoading }: StatusOverviewWidgetProps) {
  const pId = projectId || '';
  const items = statusBreakdown ?? [];
  const total = items.reduce((s, i) => s + i.count, 0);

  // Build SVG donut segments (circumference of r=38 circle ≈ 238.76)
  const CIRC = 2 * Math.PI * 38; // ~238.76
  let offset = 0;
  const segments = items.map((item, idx) => {
    const pct = total > 0 ? item.count / total : 0;
    const dash = pct * CIRC;
    const upperKey = item.status.trim().toUpperCase();
    const color = KNOWN_STATUS_COLORS[upperKey] ?? DEFAULT_STATUS_COLORS[idx % DEFAULT_STATUS_COLORS.length];
    const seg = { color, dash, offset: -offset, item };
    offset += dash;
    return seg;
  });

  return (
    <div className="card" style={{ padding: '1.5rem', height: '380px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Status overview</h2>
          <Link href={`/projects/${pId}/list`} style={{ fontSize: '0.8125rem', color: 'var(--color-green-accent)', fontWeight: 500 }}>
            View all work items
          </Link>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
          Get a snapshot of the status of your work items.
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {isLoading || items.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem 0', fontSize: '0.875rem' }}>
            {isLoading ? 'Loading...' : 'No work items yet.'}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Dynamic SVG Donut Chart */}
            <div style={{ position: 'relative', width: 170, height: 170, flexShrink: 0 }}>
              <svg width="170" height="170" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f1f2f4" strokeWidth="14" />
                {segments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="50" cy="50" r="38"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="14"
                    strokeDasharray={`${seg.dash} ${CIRC - seg.dash}`}
                    strokeDashoffset={seg.offset}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px', transition: 'stroke-dasharray 0.4s ease' }}
                  />
                ))}
              </svg>
              {/* Center Label */}
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.1 }}>{total}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Total work items
                </div>
              </div>
            </div>

            {/* Status Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 140 }}>
              {items.map((item, idx) => {
                const upperKey = item.status.trim().toUpperCase();
                const color = KNOWN_STATUS_COLORS[upperKey] ?? DEFAULT_STATUS_COLORS[idx % DEFAULT_STATUS_COLORS.length];
                return (
                  <LegendRow
                    key={item.status}
                    color={color}
                    label={formatStatusLabel(item.status)}
                    count={item.count}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendRow({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem' }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color, flexShrink: 0 }} />
      <span style={{ color: 'var(--color-text-primary)' }}>{label}:</span>
      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{count}</span>
    </div>
  );
}


