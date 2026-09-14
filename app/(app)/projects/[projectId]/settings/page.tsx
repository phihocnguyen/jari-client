'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, Users } from 'lucide-react';
import { projectApi } from '@/lib/api/project';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { toast } from '@/components/ui/Toast';

export default function ProjectSettingsPage({ params }: PageProps<'/projects/[projectId]/settings'>) {
  const [tab, setTab] = useState<'general' | 'members'>('general');
  const [resolvedParams, setResolvedParams] = useState<{ projectId: string } | null>(null);

  if (!resolvedParams) {
    params.then(p => setResolvedParams(p));
    return null;
  }

  const { projectId } = resolvedParams;

  return <ProjectSettingsContent projectId={projectId} tab={tab} setTab={setTab} />;
}

function ProjectSettingsContent({ projectId, tab, setTab }: { projectId: string; tab: 'general' | 'members'; setTab: (t: 'general' | 'members') => void }) {
  const qc = useQueryClient();

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn:  () => projectApi.get(projectId).then(r => r.data),
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn:  () => projectApi.listMembers(projectId).then(r => r.data),
    enabled:  tab === 'members',
  });

  const TABS = [
    { key: 'general', label: 'General', icon: Settings },
    { key: 'members', label: 'Members', icon: Users },
  ] as const;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          {project?.name ?? 'Project'} — Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Manage your project configuration
        </p>
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '2px solid rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? 'var(--color-green-accent)' : 'var(--color-text-secondary)',
              borderBottom: tab === t.key ? '2px solid var(--color-green-accent)' : '2px solid transparent',
              marginBottom: -2, transition: 'var(--transition-fast)',
            }}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && project && <GeneralTab projectId={projectId} project={project} />}

      {tab === 'members' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {membersLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading…</div>
          ) : members.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No members found.</div>
          ) : members.map((member, idx) => (
            <div
              key={member.userId}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderBottom: idx < members.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <Avatar name={member.fullName} src={member.avatarUrl} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{member.fullName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{member.email}</div>
              </div>
              <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                {member.role.replace('PROJECT_', '')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const updateSchema = z.object({
  name: z.string().min(2),
  key: z.string().min(1).max(10).regex(/^[A-Z0-9]+$/),
  description: z.string().optional(),
});
type UpdateForm = z.infer<typeof updateSchema>;

function GeneralTab({ projectId, project }: { projectId: string; project: { name: string; key: string; description?: string } }) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateForm>({
    resolver: zodResolver(updateSchema),
    defaultValues: { name: project.name, key: project.key, description: project.description ?? '' },
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateForm) => projectApi.update(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Project updated');
    },
    onError: () => toast.error('Failed to update project'),
  });

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>General settings</h3>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input id="proj-settings-name" label="Project name" error={errors.name?.message} {...register('name')} />
        <Input id="proj-settings-key" label="Project key" error={errors.key?.message} {...register('key')} style={{ textTransform: 'uppercase' }} />
        <Input id="proj-settings-desc" label="Description" error={errors.description?.message} {...register('description')} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" loading={mutation.isPending}>Save changes</Button>
        </div>
      </form>
    </div>
  );
}
