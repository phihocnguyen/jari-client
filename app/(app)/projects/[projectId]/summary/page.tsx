import { ProjectSummaryHeader } from '@/components/summary/ProjectSummaryHeader';
import { ProjectNavTabs } from '@/components/summary/ProjectNavTabs';
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

// ─── Project Summary Page (Server Component - SSR) ─────────────────
export default async function ProjectSummaryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const projectId = resolvedParams?.projectId ?? 'proj-demo-1';

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2.5rem' }}>
      {/* 1. Header (SSR) */}
      <ProjectSummaryHeader projectName="Teams in Space" />

      {/* 2. Interactive Navigation Tabs (CSR) */}
      <ProjectNavTabs projectId={projectId} />

      {/* 3. Metric Badges (SSR) */}
      <MetricCardsRow />

      {/* 4. Main 2-Column Dashboard Grid (SSR) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start',
      }}>
        {/* LEFT COLUMN (SSR) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <StatusOverviewWidget projectId={projectId} />
          <PriorityBreakdownWidget />
          <TeamWorkloadWidget />
        </div>

        {/* RIGHT COLUMN (SSR) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <RecentActivityWidget />
          <TypesOfWorkWidget />
          <EpicProgressWidget />
        </div>
      </div>
    </div>
  );
}
