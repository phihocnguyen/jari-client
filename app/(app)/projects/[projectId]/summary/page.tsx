'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { summaryApi } from '@/lib/api/summary';
import { MetricCardsRow } from '@/components/summary/MetricCardsRow';
import { StatusOverviewWidget } from '@/components/summary/StatusOverviewWidget';
import { PriorityBreakdownWidget } from '@/components/summary/PriorityBreakdownWidget';
import { TeamWorkloadWidget } from '@/components/summary/TeamWorkloadWidget';
import { RecentActivityWidget } from '@/components/summary/RecentActivityWidget';
import { TypesOfWorkWidget } from '@/components/summary/TypesOfWorkWidget';
import { EpicProgressWidget } from '@/components/summary/EpicProgressWidget';

// ─── Project Summary Page (Client) ──────────────────────────────────
export default function ProjectSummaryPage() {
  const params = useParams();
  const projectId = (params?.projectId as string) ?? '';

  const { data, isLoading } = useQuery({
    queryKey: ['summary', projectId],
    queryFn: () => summaryApi.get(projectId),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 2, // 2 min
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Summary
        </h1>
      </div>

      {/* 1. Metric Badges */}
      <MetricCardsRow metrics={data?.metrics} isLoading={isLoading} />

      {/* 2. Main 2-Column Dashboard Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start',
      }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <StatusOverviewWidget projectId={projectId} statusBreakdown={data?.statusBreakdown} isLoading={isLoading} />
          <PriorityBreakdownWidget priorityBreakdown={data?.priorityBreakdown} isLoading={isLoading} />
          <TeamWorkloadWidget teamWorkload={data?.teamWorkload} isLoading={isLoading} />
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <RecentActivityWidget recentActivity={data?.recentActivity} isLoading={isLoading} />
          <TypesOfWorkWidget typeBreakdown={data?.typeBreakdown} isLoading={isLoading} />
          <EpicProgressWidget epicProgress={data?.epicProgress} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

