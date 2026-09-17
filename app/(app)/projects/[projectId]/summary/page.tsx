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

// ─── Reusable Summary Loading Skeleton ──────────────────────────────
export function ProjectSummarySkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        width: '100%',
        animation: 'summaryFadeIn 0.3s ease-out forwards',
      }}
    >
      <style>{`
        @keyframes summaryFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes summaryPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.95; }
        }
        .summary-shimmer {
          background: linear-gradient(90deg, #E2E8F0 25%, #EDF2F7 50%, #E2E8F0 75%);
          background-size: 200% 100%;
          animation: summaryShimmer 1.4s infinite, summaryPulse 2s infinite ease-in-out;
        }
        @keyframes summaryShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Subpage Header with Loading Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Summary
          </h1>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              borderRadius: 20,
              backgroundColor: 'rgba(0, 117, 74, 0.08)',
              color: 'var(--color-green-brand)',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                border: '2px solid rgba(0, 117, 74, 0.25)',
                borderTopColor: 'var(--color-green-accent)',
                borderRadius: '50%',
                animation: 'orbitSpin 0.7s linear infinite',
                display: 'inline-block',
              }}
            />
            <span>Loading project data…</span>
          </div>
        </div>
      </div>

      {/* 1. Metric Badges Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '0.5rem',
        }}
      >
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 10,
              padding: '1.125rem 1.25rem',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div
              className="summary-shimmer"
              style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <div className="summary-shimmer" style={{ width: '60%', height: 20, borderRadius: 4 }} />
              <div className="summary-shimmer" style={{ width: '80%', height: 12, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Main 2-Column Dashboard Grid Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}
      >
        {[
          { title: 'Status overview', height: 260 },
          { title: 'Recent activity', height: 260 },
          { title: 'Priority breakdown', height: 240 },
          { title: 'Types of work', height: 240 },
        ].map((w, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 10,
              padding: '1.25rem 1.5rem',
              border: '1px solid #E2E8F0',
              minHeight: w.height,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="summary-shimmer" style={{ width: 140, height: 18, borderRadius: 4 }} />
              <div className="summary-shimmer" style={{ width: 70, height: 14, borderRadius: 4 }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
              <div className="summary-shimmer" style={{ width: '100%', height: 36, borderRadius: 6 }} />
              <div className="summary-shimmer" style={{ width: '92%', height: 28, borderRadius: 6 }} />
              <div className="summary-shimmer" style={{ width: '78%', height: 22, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

  if (isLoading) {
    return <ProjectSummarySkeleton />;
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
        <PriorityBreakdownWidget priorityBreakdown={data?.priorityBreakdown} isLoading={isLoading} />
        <TypesOfWorkWidget typeBreakdown={data?.typeBreakdown} isLoading={isLoading} />
        <TeamWorkloadWidget teamWorkload={data?.teamWorkload} isLoading={isLoading} />
        <EpicProgressWidget epicProgress={data?.epicProgress} isLoading={isLoading} />
      </div>
    </div>
  );
}
