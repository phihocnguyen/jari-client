'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Briefcase } from 'lucide-react';
import { workspaceApi } from '@/lib/api/workspace';
import { WorkspaceCard } from '@/components/workspace/WorkspaceCard';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function WorkspacesPage() {
  const [createOpen, setCreateOpen] = useState(false);

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn:  () => workspaceApi.list().then(r => r.data),
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.5rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Workspaces
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {workspaces?.length ?? 0} workspace{(workspaces?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          id="create-workspace-btn"
          leftIcon={<Plus size={16} />}
          onClick={() => setCreateOpen(true)}
        >
          New workspace
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (workspaces?.length ?? 0) === 0 ? (
        <div className="card" style={{ padding: '1rem' }}>
          <EmptyState
            icon={<Briefcase size={28} />}
            title="No workspaces yet"
            description="Create your first workspace to start managing projects and collaborating with your team."
            action={
              <Button leftIcon={<Plus size={15} />} onClick={() => setCreateOpen(true)}>
                Create workspace
              </Button>
            }
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {workspaces!.map(ws => (
            <WorkspaceCard key={ws.id} workspace={ws} />
          ))}
        </div>
      )}

      <CreateWorkspaceModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
