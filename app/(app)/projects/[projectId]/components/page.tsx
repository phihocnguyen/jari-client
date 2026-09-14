'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Layers, User, AlertCircle } from 'lucide-react';
import { projectApi } from '@/lib/api/project';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectComponentsPage({ params }: PageProps) {
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

  const mockComponents = [
    {
      id: 'comp-1',
      name: 'UI Design System',
      description: 'Glassmorphism cards, buttons, modals, and design tokens',
      lead: 'Sarah Chen',
      issueCount: 4,
    },
    {
      id: 'comp-2',
      name: 'Kanban Engine',
      description: 'Drag and drop columns, status transitions, and optimistic updates',
      lead: 'Robert Sofia',
      issueCount: 3,
    },
    {
      id: 'comp-3',
      name: 'WebSocket Engine',
      description: 'Real-time notifications, socket reconnects, and live event broadcasts',
      lead: 'Alex Rivera',
      issueCount: 2,
    },
    {
      id: 'comp-4',
      name: 'Auth & Security',
      description: 'OAuth2 Google login, JWT tokens, refresh interceptor, and RBAC permissions',
      lead: 'Robert Sofia',
      issueCount: 2,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Components
        </h1>

        <Button onClick={() => alert('Create component feature')}>
          <Plus size={16} /> Create component
        </Button>
      </div>

      {/* Grid of Components */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {mockComponents.map((comp) => (
          <div key={comp.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                <div style={{ padding: 8, borderRadius: 10, backgroundColor: 'var(--color-green-light)', color: 'var(--color-green-brand)' }}>
                  <Layers size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{comp.name}</h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{comp.issueCount} issues attached</span>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                {comp.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={comp.lead} size={24} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Lead: {comp.lead}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-green-accent)', fontWeight: 600, cursor: 'pointer' }}>
                View issues →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
