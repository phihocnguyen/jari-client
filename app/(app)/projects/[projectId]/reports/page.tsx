'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingDown, Zap, Layers, RefreshCw } from 'lucide-react';
import { projectApi } from '@/lib/api/project';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ReportsPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ projectId: string } | null>(null);

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  const projectId = resolvedParams?.projectId ?? '';

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? projectApi.get(projectId).then(r => r.data) : null),
    enabled: Boolean(projectId),
  });

  if (!projectId) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Reports
        </h1>
      </div>

      {/* Grid of Reports Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(540px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Sprint Burndown Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingDown size={20} color="var(--color-green-brand)" /> Sprint Burndown Chart
            </h2>
            <span className="badge badge-green">ACTIVE SPRINT</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
            Tracks the remaining story points over the course of Sprint 1.
          </p>

          {/* Visual SVG Burndown Chart */}
          <div style={{ backgroundColor: 'var(--color-canvas-warm)', borderRadius: 12, padding: '1rem', height: 220, position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 500 180" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(0,0,0,0.06)" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(0,0,0,0.06)" strokeDasharray="4 4" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="rgba(0,0,0,0.06)" strokeDasharray="4 4" />

              {/* Ideal Guidelines */}
              <line x1="20" y1="20" x2="480" y2="160" stroke="rgba(0,0,0,0.2)" strokeDasharray="6 6" strokeWidth="2" />

              {/* Actual Burndown Line */}
              <polyline
                fill="none"
                stroke="var(--color-green-accent)"
                strokeWidth="3"
                points="20,20 100,25 180,60 260,75 340,110 420,130 480,160"
              />

              {/* Data points */}
              <circle cx="20" cy="20" r="5" fill="var(--color-green-accent)" />
              <circle cx="180" cy="60" r="5" fill="var(--color-green-accent)" />
              <circle cx="340" cy="110" r="5" fill="var(--color-green-accent)" />
              <circle cx="480" cy="160" r="5" fill="var(--color-green-accent)" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
              <span>28 Feb</span>
              <span>7 Mar</span>
              <span>14 Mar</span>
            </div>
          </div>
        </div>

        {/* Velocity Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={20} color="#EAB308" /> Velocity Chart
            </h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Avg Velocity: 24 pts
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
            Compares estimated commitment vs actual completed story points across sprints.
          </p>

          {/* Visual Velocity Bar Chart */}
          <div style={{ backgroundColor: 'var(--color-canvas-warm)', borderRadius: 12, padding: '1.25rem', height: 220, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
            {[
              { sprint: 'Sprint 1', committed: 26, completed: 24 },
              { sprint: 'Sprint 2', committed: 28, completed: 25 },
              { sprint: 'Sprint 3', committed: 22, completed: 22 },
              { sprint: 'Sprint 4', committed: 30, completed: 27 },
            ].map((s, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 140 }}>
                  {/* Committed Bar */}
                  <div style={{ width: 20, height: `${(s.committed / 30) * 100}%`, backgroundColor: '#94A3B8', borderRadius: '4px 4px 0 0' }} title={`Committed: ${s.committed} pts`} />
                  {/* Completed Bar */}
                  <div style={{ width: 20, height: `${(s.completed / 30) * 100}%`, backgroundColor: 'var(--color-green-accent)', borderRadius: '4px 4px 0 0' }} title={`Completed: ${s.completed} pts`} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.sprint}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cumulative Flow Diagram */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={20} color="#6366F1" /> Cumulative Flow Diagram
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
            Shows the distribution of issue statuses over time.
          </p>

          <div style={{ backgroundColor: 'var(--color-canvas-warm)', borderRadius: 12, padding: '1rem', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Cumulative Flow Diagram initialized for current release.
            </span>
          </div>
        </div>

        {/* Created vs Resolved Issues */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={20} color="#EC4899" /> Created vs Resolved Issues
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
            Measures project throughput and resolution pace.
          </p>

          <div style={{ backgroundColor: 'var(--color-canvas-warm)', borderRadius: 12, padding: '1rem', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Resolution pace: 92% of created issues resolved within sprint timeframe.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
