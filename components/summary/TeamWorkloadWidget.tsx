import { Avatar } from '@/components/ui/Avatar';

// ─── Server Component (SSR) ────────────────────────────────────────
export function TeamWorkloadWidget() {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Team workload</h2>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
        Monitor the capacity of your team.{' '}
        <span style={{ color: 'var(--color-green-accent)', cursor: 'pointer' }}>
          Reassign issues to get the right balance
        </span>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <WorkloadBar name="Dunya Syed" percent={49} color="#94A3B8" />
        <WorkloadBar name="Andrew Park" percent={38} color="#94A3B8" />
        <WorkloadBar name="Victoria Styles" percent={84} color="#EA580C" />
        <WorkloadBar name="Melanie Lee" percent={54} color="#94A3B8" />
        <WorkloadBar name="Veronica Rodriguez" percent={22} color="#22C55E" />
      </div>
    </div>
  );
}

function WorkloadBar({ name, percent, color }: { name: string; percent: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 140, flexShrink: 0 }}>
        <Avatar name={name} size={24} />
        <span style={{ fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </span>
      </div>
      <div style={{ flex: 1, height: 16, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: color, borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 6 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>{percent}%</span>
        </div>
      </div>
    </div>
  );
}
