'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingDown, Zap, Layers, RefreshCw } from 'lucide-react';
import { projectApi } from '@/lib/api/project';
import { reportApi } from '@/lib/api/report';
import type { BurndownPoint, CumulativeFlowPoint, CreatedVsResolvedPoint, VelocitySprint } from '@/types/report';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function BurndownChart({ points }: { points: BurndownPoint[] }) {
  if (points.length === 0) {
    return (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
        No burndown data yet
      </div>
    );
  }

  const maxY = Math.max(
    1,
    ...points.map((p) => Math.max(Number(p.idealRemaining) || 0, Number(p.actualRemaining) || 0))
  );
  const w = 500;
  const h = 180;
  const padX = 20;
  const padY = 20;

  const toX = (i: number) => padX + (points.length === 1 ? 0 : (i / (points.length - 1)) * (w - padX * 2));
  const toY = (v: number) => padY + (1 - v / maxY) * (h - padY * 2);

  const idealPts = points.map((p, i) => `${toX(i)},${toY(Number(p.idealRemaining) || 0)}`).join(' ');
  const actualPts = points.map((p, i) => `${toX(i)},${toY(Number(p.actualRemaining) || 0)}`).join(' ');
  const mid = Math.floor(points.length / 2);

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-warm)', borderRadius: 12, padding: '1rem', height: 220, position: 'relative' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <line x1="0" y1="30" x2={w} y2="30" stroke="rgba(0,0,0,0.06)" strokeDasharray="4 4" />
        <line x1="0" y1="80" x2={w} y2="80" stroke="rgba(0,0,0,0.06)" strokeDasharray="4 4" />
        <line x1="0" y1="130" x2={w} y2="130" stroke="rgba(0,0,0,0.06)" strokeDasharray="4 4" />
        <polyline fill="none" stroke="rgba(0,0,0,0.25)" strokeDasharray="6 6" strokeWidth="2" points={idealPts} />
        <polyline fill="none" stroke="var(--color-green-accent)" strokeWidth="3" points={actualPts} />
        {points.map((p, i) => (
          <circle key={p.date} cx={toX(i)} cy={toY(Number(p.actualRemaining) || 0)} r="4" fill="var(--color-green-accent)" />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
        <span>{formatShortDate(points[0].date)}</span>
        {points.length > 2 && <span>{formatShortDate(points[mid].date)}</span>}
        <span>{formatShortDate(points[points.length - 1].date)}</span>
      </div>
    </div>
  );
}

function VelocityChart({ sprints }: { sprints: VelocitySprint[] }) {
  if (sprints.length === 0) {
    return (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
        No completed/active sprints yet
      </div>
    );
  }

  const maxVal = Math.max(1, ...sprints.flatMap((s) => [Number(s.committed) || 0, Number(s.completed) || 0]));

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-warm)', borderRadius: 12, padding: '1.25rem', height: 220, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
      {sprints.map((s) => (
        <div key={s.sprintId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 140 }}>
            <div
              style={{ width: 20, height: `${((Number(s.committed) || 0) / maxVal) * 100}%`, backgroundColor: '#94A3B8', borderRadius: '4px 4px 0 0', minHeight: 2 }}
              title={`Committed: ${s.committed} pts`}
            />
            <div
              style={{ width: 20, height: `${((Number(s.completed) || 0) / maxVal) * 100}%`, backgroundColor: 'var(--color-green-accent)', borderRadius: '4px 4px 0 0', minHeight: 2 }}
              title={`Completed: ${s.completed} pts`}
            />
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-primary)', textAlign: 'center', maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {s.sprintName}
          </span>
        </div>
      ))}
    </div>
  );
}

function CumulativeFlowChart({ points }: { points: CumulativeFlowPoint[] }) {
  if (points.length === 0) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
        No flow data yet
      </div>
    );
  }

  const maxY = Math.max(1, ...points.map((p) => p.todo + p.inProgress + p.done));
  const w = 500;
  const h = 160;
  const pad = 12;

  const stackPath = (getter: (p: CumulativeFlowPoint) => number) => {
    const top = points.map((p, i) => {
      const x = pad + (points.length === 1 ? 0 : (i / (points.length - 1)) * (w - pad * 2));
      const y = pad + (1 - getter(p) / maxY) * (h - pad * 2);
      return `${x},${y}`;
    });
    const bottom = [...points].reverse().map((_, revIdx) => {
      const i = points.length - 1 - revIdx;
      const x = pad + (points.length === 1 ? 0 : (i / (points.length - 1)) * (w - pad * 2));
      return `${x},${h - pad}`;
    });
    return `M ${top.join(' L ')} L ${bottom.join(' L ')} Z`;
  };

  const doneTop = (p: CumulativeFlowPoint) => p.done;
  const ipTop = (p: CumulativeFlowPoint) => p.done + p.inProgress;
  const allTop = (p: CumulativeFlowPoint) => p.done + p.inProgress + p.todo;

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-warm)', borderRadius: 12, padding: '1rem', height: 200 }}>
      <svg width="100%" height="140" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <path d={stackPath(allTop)} fill="rgba(148, 163, 184, 0.55)" />
        <path d={stackPath(ipTop)} fill="rgba(99, 102, 241, 0.55)" />
        <path d={stackPath(doneTop)} fill="rgba(34, 197, 94, 0.55)" />
      </svg>
      <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--color-text-secondary)', justifyContent: 'center' }}>
        <span>● Done</span>
        <span style={{ color: '#6366F1' }}>● In progress</span>
        <span style={{ color: '#94A3B8' }}>● To do</span>
      </div>
    </div>
  );
}

function CreatedVsResolvedChart({ points }: { points: CreatedVsResolvedPoint[] }) {
  if (points.length === 0) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
        No throughput data yet
      </div>
    );
  }

  const maxY = Math.max(1, ...points.map((p) => Math.max(p.created, p.resolved)));
  const w = 500;
  const h = 140;
  const pad = 12;
  const toX = (i: number) => pad + (points.length === 1 ? 0 : (i / (points.length - 1)) * (w - pad * 2));
  const toY = (v: number) => pad + (1 - v / maxY) * (h - pad * 2);
  const createdLine = points.map((p, i) => `${toX(i)},${toY(p.created)}`).join(' ');
  const resolvedLine = points.map((p, i) => `${toX(i)},${toY(p.resolved)}`).join(' ');

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-warm)', borderRadius: 12, padding: '1rem', height: 200 }}>
      <svg width="100%" height="140" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <polyline fill="none" stroke="#EC4899" strokeWidth="2.5" points={createdLine} />
        <polyline fill="none" stroke="var(--color-green-accent)" strokeWidth="2.5" points={resolvedLine} />
      </svg>
      <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--color-text-secondary)', justifyContent: 'center' }}>
        <span style={{ color: '#EC4899' }}>● Created</span>
        <span>● Resolved</span>
      </div>
    </div>
  );
}

export default function ReportsPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ projectId: string } | null>(null);

  useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  const projectId = resolvedParams?.projectId ?? '';

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? projectApi.get(projectId).then((r) => r.data) : null),
    enabled: Boolean(projectId),
  });

  const { data: reports, isLoading, isError } = useQuery({
    queryKey: ['project-reports', projectId],
    queryFn: () => reportApi.get(projectId, { days: 14, velocitySprints: 8 }),
    enabled: Boolean(projectId),
  });

  const avgVelocity = useMemo(() => {
    const v = Number(reports?.velocity?.averageCompleted ?? 0);
    return Number.isFinite(v) ? v : 0;
  }, [reports]);

  const resolutionPct = useMemo(() => {
    const rate = Number(reports?.createdVsResolved?.resolutionRate ?? 0);
    return Math.round(rate * 100);
  }, [reports]);

  if (!projectId) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Reports{project?.name ? ` · ${project.name}` : ''}
        </h1>
      </div>

      {isLoading && (
        <div style={{ padding: '2rem', color: 'var(--color-text-secondary)' }}>Loading reports…</div>
      )}
      {isError && (
        <div style={{ padding: '1rem', color: '#b91c1c' }}>Failed to load reports. Is the backend running?</div>
      )}

      {reports && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(540px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingDown size={20} color="var(--color-green-brand)" /> Sprint Burndown Chart
              </h2>
              {reports.burndown.sprintStatus && (
                <span className="badge badge-green">{reports.burndown.sprintStatus}</span>
              )}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              {reports.burndown.message
                || `Tracks remaining story points over ${reports.burndown.sprintName || 'the sprint'} (${reports.burndown.totalStoryPoints ?? 0} pts committed).`}
            </p>
            <BurndownChart points={reports.burndown.points || []} />
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={20} color="#EAB308" /> Velocity Chart
              </h2>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                Avg Velocity: {avgVelocity} pts
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Compares estimated commitment vs actual completed story points across sprints.
            </p>
            <VelocityChart sprints={reports.velocity.sprints || []} />
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={20} color="#6366F1" /> Cumulative Flow Diagram
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Shows the distribution of issue statuses over the last 14 days.
            </p>
            <CumulativeFlowChart points={reports.cumulativeFlow.points || []} />
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={20} color="#EC4899" /> Created vs Resolved Issues
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Resolution pace: {resolutionPct}% of created issues resolved in this window
              ({reports.createdVsResolved.totalResolved}/{reports.createdVsResolved.totalCreated}).
            </p>
            <CreatedVsResolvedChart points={reports.createdVsResolved.points || []} />
          </div>
        </div>
      )}
    </div>
  );
}
