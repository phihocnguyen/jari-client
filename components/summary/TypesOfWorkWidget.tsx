import { CheckSquare, Bookmark, Zap } from 'lucide-react';

// ─── Server Component (SSR) ────────────────────────────────────────
export function TypesOfWorkWidget() {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Types of work</h2>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
        Get a breakdown of issues by their types.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <TypeProgressRow icon={<CheckSquare size={16} color="#2563EB" />} label="Task" percent={49} />
        <TypeProgressRow icon={<Bookmark size={16} color="#0284C7" />} label="Sub-task" percent={15} />
        <TypeProgressRow icon={<Zap size={16} color="#9333EA" />} label="Epic" percent={64} />
      </div>
    </div>
  );
}

function TypeProgressRow({ icon, label, percent }: { icon: React.ReactNode; label: string; percent: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 90, flexShrink: 0, fontSize: '0.8125rem', fontWeight: 500 }}>
        {icon}
        <span>{label}</span>
      </div>
      <div style={{ flex: 1, height: 18, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#64748B', borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>{percent}%</span>
        </div>
      </div>
    </div>
  );
}
