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
import { GlobalLoadingOverlay } from '@/components/loading';

// ─── Project Summary Page (Client) ──────────────────────────────────
export default function ProjectSummaryPage() {
  const params = useParams();
  const projectId = (params?.projectId as string) ?? '';

  const { data, isLoading } = useQuery({
    queryKey: ['summary', projectId],
    queryFn: () => summaryApi.get(projectId),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 5, // 5 min
  });

  if (isLoading && !data) {
    return (
      <GlobalLoadingOverlay
        label="Loading project summary..."
        sublabel="Preparing workspace metrics and recent activity"
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        animation: 'summaryFadeIn 0.3s ease-out forwards',
      }}
    >
      <style>{`
        @keyframes summaryFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Subpage Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Summary
        </h1>
      </div>

      {/* 1. Metric Badges */}
      <MetricCardsRow metrics={data?.metrics} isLoading={isLoading} />

      {/* 2. Main 2-Column Dashboard Grid with Equal Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}
      >
        <StatusOverviewWidget projectId={projectId} statusBreakdown={data?.statusBreakdown} isLoading={isLoading} />
        <RecentActivityWidget recentActivity={data?.recentActivity} isLoading={isLoading} />
        <PriorityBreakdownWidget projectId={projectId} priorityBreakdown={data?.priorityBreakdown} isLoading={isLoading} />
        <TypesOfWorkWidget projectId={projectId} typeBreakdown={data?.typeBreakdown} isLoading={isLoading} />
        <TeamWorkloadWidget teamWorkload={data?.teamWorkload} isLoading={isLoading} />
        <EpicProgressWidget projectId={projectId} epicProgress={data?.epicProgress} isLoading={isLoading} />
      </div>
    </div>
  );
}
