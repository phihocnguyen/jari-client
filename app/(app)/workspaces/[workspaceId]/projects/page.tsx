'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, FolderKanban } from 'lucide-react';
import { projectApi } from '@/lib/api/project';
import { ProjectCard } from '@/components/project/ProjectCard';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ProjectsPage({ params }: PageProps<'/workspaces/[workspaceId]/projects'>) {
  const [createOpen, setCreateOpen] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ workspaceId: string } | null>(null);

  if (!resolvedParams) {
    params.then(p => setResolvedParams(p));
    return null;
  }

  const { workspaceId } = resolvedParams;

  return <ProjectsContent workspaceId={workspaceId} createOpen={createOpen} setCreateOpen={setCreateOpen} />;
}

function ProjectsContent({
  workspaceId, createOpen, setCreateOpen,
}: {
  workspaceId: string; createOpen: boolean; setCreateOpen: (v: boolean) => void;
}) {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn:  () => projectApi.list(workspaceId).then(r => r.data),
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>Projects</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {projects?.length ?? 0} project{(projects?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Button id="create-project-btn" leftIcon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
          New project
        </Button>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (projects?.length ?? 0) === 0 ? (
        <div className="card" style={{ padding: '1rem' }}>
          <EmptyState
            icon={<FolderKanban size={28} />}
            title="No projects yet"
            description="Create your first project to start tracking issues and managing sprints."
            action={<Button leftIcon={<Plus size={15} />} onClick={() => setCreateOpen(true)}>Create project</Button>}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {projects!.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} workspaceId={workspaceId} />
    </div>
  );
}
