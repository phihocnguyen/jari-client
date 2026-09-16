'use client';

import { CheckCircle2, Edit3, FileText, Calendar } from 'lucide-react';
import type { SummaryMetrics } from '@/types/summary';

interface MetricCardsRowProps {
  metrics?: SummaryMetrics;
  isLoading?: boolean;
}

// ─── Metric Cards Row ──────────────────────────────────────────────
export function MetricCardsRow({ metrics, isLoading }: MetricCardsRowProps) {
  const cards = [
    {
      icon: <CheckCircle2 size={18} color="#00754A" />,
      title: isLoading ? '—' : `${metrics?.completedLast7Days ?? 0} completed`,
      subtitle: 'in the last 7 days',
      bg: '#D4E9E2',
    },
    {
      icon: <Edit3 size={18} color="#6366F1" />,
      title: isLoading ? '—' : `${metrics?.updatedLast7Days ?? 0} updated`,
      subtitle: 'in the last 7 days',
      bg: '#EEF2FF',
    },
    {
      icon: <FileText size={18} color="#0EA5E9" />,
      title: isLoading ? '—' : `${metrics?.createdLast7Days ?? 0} created`,
      subtitle: 'in the last 7 days',
      bg: '#E0F2FE',
    },
    {
      icon: <Calendar size={18} color="#EF4444" />,
      title: isLoading ? '—' : `${metrics?.dueNext7Days ?? 0} due`,
      subtitle: 'in the next 7 days',
      bg: '#FEE2E2',
    },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1rem', marginBottom: '1.5rem',
    }}>
      {cards.map((c, i) => (
        <MetricCard key={i} {...c} isLoading={isLoading} />
      ))}
    </div>
  );
}

function MetricCard({ icon, title, subtitle, bg, isLoading }: {
  icon: React.ReactNode; title: string; subtitle: string; bg: string; isLoading?: boolean;
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
        <div style={{
          fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2,
          opacity: isLoading ? 0.4 : 1, transition: 'opacity 0.2s',
        }}>
          {title}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

