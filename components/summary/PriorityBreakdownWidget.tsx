import { Ban, ChevronsUp, ArrowUp, Minus, ArrowDown } from 'lucide-react';

// ─── Server Component (SSR) ────────────────────────────────────────
export function PriorityBreakdownWidget() {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Priority breakdown</h2>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
        Get a holistic view of how work is being prioritized.{' '}
        <span style={{ color: 'var(--color-green-accent)', cursor: 'pointer' }}>
          See what your team&apos;s been focusing on
        </span>
      </p>

      {/* Priority Bar Chart */}
      <div style={{ backgroundColor: '#FAF9F6', borderRadius: 12, padding: '1.25rem 1rem 0.75rem' }}>
        <div style={{ display: 'flex', height: 160, alignItems: 'flex-end', justifyContent: 'space-around', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          {[
            { label: 'Blocked', height: '40%' },
            { label: 'Highest', height: '58%' },
            { label: 'High', height: '64%' },
            { label: 'Medium', height: '55%' },
            { label: 'Low', height: '38%' },
            { label: 'Lowest', height: '48%' },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end', width: 44 }}>
              <div style={{ width: 28, height: item.height, backgroundColor: '#64748B', borderRadius: '4px 4px 0 0' }} />
            </div>
          ))}
        </div>

        {/* X-Axis Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: 8 }}>
          {[
            { label: 'Blocked', icon: <Ban size={13} color="#DC2626" /> },
            { label: 'Highest', icon: <ChevronsUp size={13} color="#DC2626" /> },
            { label: 'High', icon: <ArrowUp size={13} color="#EA580C" /> },
            { label: 'Medium', icon: <Minus size={13} color="#D97706" /> },
            { label: 'Low', icon: <ArrowDown size={13} color="#2563EB" /> },
            { label: 'Lowest', icon: <ArrowDown size={13} color="#0284C7" /> },
          ].map((cat, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', color: 'var(--color-text-secondary)', width: 44, justifyContent: 'center' }}>
              {cat.icon}
              <span>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
