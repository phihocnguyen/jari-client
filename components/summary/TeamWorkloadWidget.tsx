'use client';

import { Avatar } from '@/components/ui/Avatar';
import type { MemberWorkload } from '@/types/summary';

interface TeamWorkloadWidgetProps {
  teamWorkload?: MemberWorkload[];
  isLoading?: boolean;
}

// ─── Team Workload Widget ──────────────────────────────────────────
export function TeamWorkloadWidget({ teamWorkload, isLoading }: TeamWorkloadWidgetProps) {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Team workload</h2>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
        Monitor the capacity of your team across active issues.
      </p>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 140, height: 24, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4 }} />
              <div style={{ flex: 1, height: 16, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ) : !teamWorkload || teamWorkload.length === 0 ? (
        <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          No team workload data available yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {teamWorkload.map((member) => (
            <WorkloadBar
              key={member.userId}
              name={member.fullName || 'Unassigned'}
              percent={member.percent}
              assignedCount={member.assignedCount}
              color={member.percent > 70 ? '#EA580C' : member.percent > 30 ? '#00754A' : '#94A3B8'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkloadBar({
  name,
  percent,
  assignedCount,
  color,
}: {
  name: string;
  percent: number;
  assignedCount: number;
  color: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 140, flexShrink: 0 }}>
        <Avatar name={name} size={24} />
        <span
          title={name}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </span>
      </div>
      <div
        style={{
          flex: 1,
          height: 16,
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
            backgroundColor: color,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 6,
            transition: 'width 0.4s ease',
          }}
        >
          {percent > 5 && (
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>{percent}%</span>
          )}
        </div>
      </div>
      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', minWidth: 45, textAlign: 'right' }}>
        {assignedCount} {assignedCount === 1 ? 'task' : 'tasks'}
      </span>
    </div>
  );
}

