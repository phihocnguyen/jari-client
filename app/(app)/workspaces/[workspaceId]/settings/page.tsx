'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Trash2, Settings, Users } from 'lucide-react';
import { workspaceApi } from '@/lib/api/workspace';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import type { WorkspaceRole } from '@/types/workspace';
import {
  updateWorkspaceSchema,
  inviteMemberSchema,
  type UpdateWorkspaceFormData,
  type InviteMemberFormData,
} from '@/lib/validations/workspace';

// ─── Workspace Settings Page ──────────────────────────────────────
export default function WorkspaceSettingsPage({ params }: PageProps<'/workspaces/[workspaceId]/settings'>) {
  const [tab, setTab]           = useState<'general' | 'members'>('general');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ workspaceId: string } | null>(null);

  // Resolve async params (Next.js 16)
  if (!resolvedParams) {
    params.then(p => setResolvedParams(p));
    return null;
  }

  const { workspaceId } = resolvedParams;

  return (
    <WorkspaceSettingsContent workspaceId={workspaceId} tab={tab} setTab={setTab}
      inviteOpen={inviteOpen} setInviteOpen={setInviteOpen} />
  );
}

// ─── Inner Client Component ───────────────────────────────────────
function WorkspaceSettingsContent({
  workspaceId, tab, setTab, inviteOpen, setInviteOpen,
}: {
  workspaceId: string;
  tab: 'general' | 'members';
  setTab: (t: 'general' | 'members') => void;
  inviteOpen: boolean;
  setInviteOpen: (v: boolean) => void;
}) {
  const qc = useQueryClient();

  const { data: workspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn:  () => workspaceApi.get(workspaceId).then(r => r.data),
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn:  () => workspaceApi.listMembers(workspaceId).then(r => r.data),
    enabled:  tab === 'members',
  });

  const removeMember = useMutation({
    mutationFn: (userId: string) => workspaceApi.removeMember(workspaceId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
      toast.success('Member removed');
    },
    onError: () => toast.error('Failed to remove member'),
  });

  const TABS = [
    { key: 'general', label: 'General', icon: Settings },
    { key: 'members', label: 'Members', icon: Users },
  ] as const;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          {workspace?.name ?? 'Workspace'} — Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Manage your workspace configuration and members
        </p>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: 'flex', gap: 2,
        borderBottom: '2px solid rgba(0,0,0,0.08)',
        marginBottom: '1.5rem',
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? 'var(--color-green-accent)' : 'var(--color-text-secondary)',
              borderBottom: tab === t.key ? '2px solid var(--color-green-accent)' : '2px solid transparent',
              marginBottom: -2,
              transition: 'var(--transition-fast)',
            }}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {tab === 'general' && workspace && (
        <GeneralTab workspaceId={workspaceId} workspace={workspace} />
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <Button leftIcon={<UserPlus size={15} />} onClick={() => setInviteOpen(true)} size="sm">
              Invite member
            </Button>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            {membersLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading…</div>
            ) : members.map((member, idx) => (
              <div
                key={member.userId}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px',
                  borderBottom: idx < members.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <Avatar name={member.fullName} src={member.avatarUrl} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{member.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{member.email}</div>
                </div>
                <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                  {member.role.replace('WORKSPACE_', '')}
                </span>
                <button
                  onClick={() => removeMember.mutate(member.userId)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-secondary)', borderRadius: '50%',
                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-red)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,32,20,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)'; (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                  title="Remove member"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <InviteMemberModal
            open={inviteOpen}
            onClose={() => setInviteOpen(false)}
            workspaceId={workspaceId}
          />
        </div>
      )}
    </div>
  );
}

// ─── General Tab ──────────────────────────────────────────────────
function GeneralTab({ workspaceId, workspace }: { workspaceId: string; workspace: { name: string; slug: string } }) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateWorkspaceFormData>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: { name: workspace.name, slug: workspace.slug },
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateWorkspaceFormData) => workspaceApi.update(workspaceId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace updated');
    },
    onError: () => toast.error('Failed to update workspace'),
  });

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>General settings</h3>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input id="ws-settings-name" label="Workspace name" error={errors.name?.message} {...register('name')} />
        <Input id="ws-settings-slug" label="Slug" error={errors.slug?.message} {...register('slug')} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" loading={mutation.isPending}>Save changes</Button>
        </div>
      </form>
    </div>
  );
}

// ─── InviteMemberModal ────────────────────────────────────────────
function InviteMemberModal({ open, onClose, workspaceId }: { open: boolean; onClose: () => void; workspaceId: string }) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { role: 'WORKSPACE_MEMBER' },
  });

  const mutation = useMutation({
    mutationFn: (data: InviteMemberFormData) => workspaceApi.inviteMember(workspaceId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
      toast.success('Member invited!');
      reset(); onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to invite member';
      toast.error('Error', msg);
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Invite member" size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={mutation.isPending} onClick={handleSubmit(d => mutation.mutate(d))}>
            Send invite
          </Button>
        </>
      }
    >
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input id="invite-email" label="Email address" type="email" placeholder="colleague@example.com"
          error={errors.email?.message} {...register('email')} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Role</label>
          <select
            {...register('role')}
            className="input"
            style={{ cursor: 'pointer' }}
          >
            <option value="WORKSPACE_ADMIN">Admin</option>
            <option value="WORKSPACE_MEMBER">Member</option>
            <option value="WORKSPACE_VIEWER">Viewer</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}
