'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Tag, CheckCircle2, Calendar, FileText } from 'lucide-react';
import { projectApi } from '@/lib/api/project';
import { Button } from '@/components/ui/Button';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ReleasesPage({ params }: PageProps) {
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

  const mockReleases = [
    {
      id: 'rel-1',
      version: 'v1.0.0-beta',
      description: 'Initial beta launch of Teams in Space Agile Kanban Board',
      status: 'UNRELEASED',
      releaseDate: '2026-03-31',
      totalIssues: 12,
      completedIssues: 10,
    },
    {
      id: 'rel-2',
      version: 'v1.1.0',
      description: 'WebSocket Notifications & Advanced Agile Analytics Reports',
      status: 'UNRELEASED',
      releaseDate: '2026-04-30',
      totalIssues: 8,
      completedIssues: 3,
    },
    {
      id: 'rel-0',
      version: 'v0.9.0',
      description: 'Alpha release - Core issue management and sprint backlog',
      status: 'RELEASED',
      releaseDate: '2026-02-15',
      totalIssues: 15,
      completedIssues: 15,
    },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            <span>{project?.name || 'Teams in Space'}</span>
            <span>/</span>
            <span>Releases</span>
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700 }}>Releases & Version Management</h1>
        </div>

        <Button onClick={() => alert('Create release version feature')}>
          <Plus size={16} /> Create version
        </Button>
      </div>

      {/* Releases List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {mockReleases.map((rel) => {
          const progress = Math.round((rel.completedIssues / rel.totalIssues) * 100);

          return (
            <div key={rel.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: 6, borderRadius: 8, backgroundColor: 'var(--color-green-light)', color: 'var(--color-green-brand)' }}>
                    <Tag size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{rel.version}</h2>
                      <span className={`badge ${rel.status === 'RELEASED' ? 'badge-green' : 'badge-gold'}`}>
                        {rel.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                      {rel.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    <Calendar size={15} />
                    <span>Target: {new Date(rel.releaseDate).toLocaleDateString()}</span>
                  </div>
                  <Button variant="outlined" size="sm">
                    <FileText size={14} /> Release Notes
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>Release Progress</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{rel.completedIssues} of {rel.totalIssues} issues ({progress}%)</span>
                </div>
                <div style={{ width: '100%', height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', backgroundColor: rel.status === 'RELEASED' ? '#22C55E' : 'var(--color-green-accent)' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
