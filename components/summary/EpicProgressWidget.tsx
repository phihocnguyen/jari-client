'use client';

import { Zap } from 'lucide-react';
import type { EpicProgress } from '@/types/summary';

interface EpicProgressWidgetProps {
  epicProgress?: EpicProgress[];
  isLoading?: boolean;
}

// ─── Epic Progress Widget ───────────────────────────────────────────
export function EpicProgressWidget({ epicProgress, isLoading }: EpicProgressWidgetProps) {
  return (
    <div className="card" style={{ padding: '1.5rem', height: '380px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Epic progress</h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          See how your epics are progressing at a glance.
        </p>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#22C55E' }} />
            <span>Done</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#3B82F6' }} />
            <span>In progress</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#94A3B8' }} />
            <span>To do</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ width: '50%', height: 14, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4 }} />
                <div style={{ width: '100%', height: 16, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        ) : !epicProgress || epicProgress.length === 0 ? (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            No epics found in this project.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {epicProgress.map((epic) => (
              <EpicSegmentRow
                key={epic.epicId}
                keyName={epic.epicKey}
                title={epic.epicTitle}
                done={epic.donePercent}
                inProgress={epic.inProgressPercent}
                todo={epic.todoPercent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EpicSegmentRow({
  keyName,
  title,
  done,
  inProgress,
  todo,
}: {
  keyName: string;
  title: string;
  done: number;
  inProgress: number;
  todo: number;
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.8125rem',
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        <Zap size={14} color="#9333EA" style={{ flexShrink: 0 }} />
        {keyName && (
          <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'inherit', flexShrink: 0 }}>
            {keyName}
          </span>
        )}
        <span
          title={title}
          style={{
            color: 'var(--color-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          height: 16,
          borderRadius: 4,
          overflow: 'hidden',
          display: 'flex',
          backgroundColor: 'rgba(0,0,0,0.06)',
        }}
      >
        {done > 0 && (
          <div
            style={{
              width: `${done}%`,
              backgroundColor: '#22C55E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#fff',
              transition: 'width 0.4s ease',
            }}
          >
            {done > 8 ? `${done}%` : ''}
          </div>
        )}
        {inProgress > 0 && (
          <div
            style={{
              width: `${inProgress}%`,
              backgroundColor: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#fff',
              transition: 'width 0.4s ease',
            }}
          >
            {inProgress > 8 ? `${inProgress}%` : ''}
          </div>
        )}
        {todo > 0 && (
          <div
            style={{
              width: `${todo}%`,
              backgroundColor: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#fff',
              transition: 'width 0.4s ease',
            }}
          >
            {todo > 8 ? `${todo}%` : ''}
          </div>
        )}
      </div>
    </div>
  );
}

