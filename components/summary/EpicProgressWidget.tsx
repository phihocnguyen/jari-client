import { Zap } from 'lucide-react';

// ─── Server Component (SSR) ────────────────────────────────────────
export function EpicProgressWidget() {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Epic progress</h2>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-green-accent)', fontWeight: 500, cursor: 'pointer' }}>
          View all epics
        </span>
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

      {/* Multi-Segmented Epic Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <EpicSegmentRow
          keyName="PLAT-7"
          title="User Authentication Overhaul"
          done={0} inProgress={45} todo={45}
        />
        <EpicSegmentRow
          keyName="PLAT-7"
          title="Mobile App User Interface Redesign"
          done={60} inProgress={24} todo={16}
        />
        <EpicSegmentRow
          keyName="PLAT-7"
          title="API Integration for Third-Party Services"
          done={70} inProgress={25} todo={5}
        />
        <EpicSegmentRow
          keyName="PLAT-7"
          title="Make working with our space travel partners easier"
          done={30} inProgress={55} todo={15}
        />
      </div>
    </div>
  );
}

function EpicSegmentRow({ keyName, title, done, inProgress, todo }: {
  keyName: string; title: string; done: number; inProgress: number; todo: number;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 600, marginBottom: 6 }}>
        <Zap size={14} color="#9333EA" />
        <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{keyName}</span>
        <span style={{ color: 'var(--color-text-primary)' }}>{title}</span>
      </div>
      <div style={{ height: 16, borderRadius: 4, overflow: 'hidden', display: 'flex', backgroundColor: 'rgba(0,0,0,0.06)' }}>
        {done > 0 && (
          <div style={{ width: `${done}%`, backgroundColor: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>
            {done}%
          </div>
        )}
        {inProgress > 0 && (
          <div style={{ width: `${inProgress}%`, backgroundColor: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>
            {inProgress}%
          </div>
        )}
        {todo > 0 && (
          <div style={{ width: `${todo}%`, backgroundColor: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>
            {todo}%
          </div>
        )}
      </div>
    </div>
  );
}
