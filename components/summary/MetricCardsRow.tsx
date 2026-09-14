import { CheckCircle2, Edit3, FileText, Calendar } from 'lucide-react';

// ─── Server Component (SSR) ────────────────────────────────────────
export function MetricCardsRow() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1rem', marginBottom: '1.5rem',
    }}>
      <MetricCard
        icon={<CheckCircle2 size={18} color="#22C55E" />}
        title="14 completed"
        subtitle="in the last 7 days"
        bg="#DCFCE7"
      />
      <MetricCard
        icon={<Edit3 size={18} color="#6366F1" />}
        title="8 updated"
        subtitle="in the last 7 days"
        bg="#EEF2FF"
      />
      <MetricCard
        icon={<FileText size={18} color="#0EA5E9" />}
        title="7 created"
        subtitle="in the last 7 days"
        bg="#E0F2FE"
      />
      <MetricCard
        icon={<Calendar size={18} color="#EF4444" />}
        title="12 due"
        subtitle="in the next 7 days"
        bg="#FEE2E2"
      />
    </div>
  );
}

function MetricCard({ icon, title, subtitle, bg }: {
  icon: React.ReactNode; title: string; subtitle: string; bg: string;
}) {
  return (
    <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, backgroundColor: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}
