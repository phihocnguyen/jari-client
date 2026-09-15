import Link from 'next/link';

// ─── Server Component (SSR) ────────────────────────────────────────
interface StatusOverviewWidgetProps {
  projectId: string;
}

export function StatusOverviewWidget({ projectId }: StatusOverviewWidgetProps) {
  const pId = projectId || '00000000-0000-0000-0000-000000000003';

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Status overview</h2>
        <Link href={`/projects/${pId}/list`} style={{ fontSize: '0.8125rem', color: 'var(--color-green-accent)', fontWeight: 500 }}>
          View all issues
        </Link>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
        Get a snapshot of the status of your issues.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        {/* SVG Donut Chart */}
        <div style={{ position: 'relative', width: 170, height: 170, flexShrink: 0 }}>
          <svg width="170" height="170" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="38" fill="transparent" stroke="#0284C7" strokeWidth="14" strokeDasharray="100 140" strokeDashoffset="0" />
            <circle cx="50" cy="50" r="38" fill="transparent" stroke="#7C3AED" strokeWidth="14" strokeDasharray="50 190" strokeDashoffset="-100" />
            <circle cx="50" cy="50" r="38" fill="transparent" stroke="#EA580C" strokeWidth="14" strokeDasharray="30 210" strokeDashoffset="-150" />
            <circle cx="50" cy="50" r="38" fill="transparent" stroke="#DB2777" strokeWidth="14" strokeDasharray="32 208" strokeDashoffset="-180" />
            <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1E3A8A" strokeWidth="14" strokeDasharray="19 221" strokeDashoffset="-212" />
            <circle cx="50" cy="50" r="38" fill="transparent" stroke="#94A3B8" strokeWidth="14" strokeDasharray="8 232" strokeDashoffset="-231" />
          </svg>
          {/* Donut Center Label */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.1 }}>248</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', maxWidth: 70 }}>
              Total issue count
            </div>
          </div>
        </div>

        {/* Status Legend List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <LegendRow color="#0284C7" label="Deprioritized" count={100} />
          <LegendRow color="#7C3AED" label="To do" count={50} />
          <LegendRow color="#EA580C" label="Boulders" count={30} />
          <LegendRow color="#DB2777" label="In design review" count={32} />
          <LegendRow color="#1E3A8A" label="In eng development" count={19} />
          <LegendRow color="#94A3B8" label="In progress" count={8} />
        </div>
      </div>
    </div>
  );
}

function LegendRow({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color }} />
        <span style={{ color: 'var(--color-text-primary)' }}>{label}:</span>
      </div>
      <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{count}</span>
    </div>
  );
}
