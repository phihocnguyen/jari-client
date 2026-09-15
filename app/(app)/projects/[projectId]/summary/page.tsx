import { MetricCardsRow } from '@/components/summary/MetricCardsRow';
import { StatusOverviewWidget } from '@/components/summary/StatusOverviewWidget';
import { PriorityBreakdownWidget } from '@/components/summary/PriorityBreakdownWidget';
import { TeamWorkloadWidget } from '@/components/summary/TeamWorkloadWidget';
import { RecentActivityWidget } from '@/components/summary/RecentActivityWidget';
import { TypesOfWorkWidget } from '@/components/summary/TypesOfWorkWidget';
import { EpicProgressWidget } from '@/components/summary/EpicProgressWidget';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

// ─── Project Summary Sub-Page ──────────────────────────────────────
export default async function ProjectSummaryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const projectId = resolvedParams?.projectId ?? '00000000-0000-0000-0000-000000000003';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Header (matching Board) */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '0.25rem',
      }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Summary
        </h1>
      </div>

      {/* 1. Metric Badges (SSR) */}
      <MetricCardsRow />

      {/* 2. Main 2-Column Dashboard Grid (SSR) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start',
      }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <StatusOverviewWidget projectId={projectId} />
          <PriorityBreakdownWidget />
          <TeamWorkloadWidget />
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <RecentActivityWidget />
          <TypesOfWorkWidget />
          <EpicProgressWidget />
        </div>
      </div>
    </div>
  );
}
