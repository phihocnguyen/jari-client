'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UserPlus,
  Trash2,
  Settings,
  Users,
  ShieldCheck,
  Crown,
  FolderKanban,
  Check,
  Search,
  AlertCircle,
} from 'lucide-react';
import { workspaceApi } from '@/lib/api/workspace';
import { userApi } from '@/lib/api/user';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import type { WorkspaceRole, WorkspaceMember, Workspace } from '@/types/workspace';
import type { Project } from '@/types/project';
import type { User } from '@/types/auth';
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
  const [projectModalMember, setProjectModalMember] = useState<WorkspaceMember | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ workspaceId: string } | null>(null);

  // Resolve async params (Next.js 16)
  if (!resolvedParams) {
    params.then(p => setResolvedParams(p));
    return null;
  }

  const { workspaceId } = resolvedParams;

  return (
    <WorkspaceSettingsContent
      workspaceId={workspaceId}
      tab={tab}
      setTab={setTab}
      inviteOpen={inviteOpen}
      setInviteOpen={setInviteOpen}
      projectModalMember={projectModalMember}
      setProjectModalMember={setProjectModalMember}
    />
  );
}

// ─── Inner Client Component ───────────────────────────────────────
function WorkspaceSettingsContent({
  workspaceId,
  tab,
  setTab,
  inviteOpen,
  setInviteOpen,
  projectModalMember,
  setProjectModalMember,
}: {
  workspaceId: string;
  tab: 'general' | 'members';
  setTab: (t: 'general' | 'members') => void;
  inviteOpen: boolean;
  setInviteOpen: (v: boolean) => void;
  projectModalMember: WorkspaceMember | null;
  setProjectModalMember: (m: WorkspaceMember | null) => void;
}) {
  const qc = useQueryClient();
  const currentUser = useAuthStore(s => s.user);

  const { data: workspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn:  () => workspaceApi.get(workspaceId).then(r => r.data),
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn:  () => workspaceApi.listMembers(workspaceId).then(r => r.data),
    enabled:  tab === 'members',
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['workspace-projects', workspaceId],
    queryFn:  () => workspaceApi.listProjects(workspaceId).then(r => r.data),
  });

  // Calculate permissions
  const isOwner = Boolean(
    workspace?.ownerId && currentUser?.id && workspace.ownerId === currentUser.id
  );
  const currentUserMember = members.find(m => m.userId === currentUser?.id);
  const isAdmin = Boolean(
    isOwner || currentUserMember?.role === 'WORKSPACE_ADMIN'
  );

  // Role update mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: WorkspaceRole }) =>
      workspaceApi.updateMemberRole(workspaceId, userId, { roleName }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
      toast.success(
        'Role updated',
        `Member role changed to ${res.data?.role?.replace('WORKSPACE_', '') ?? 'new role'}`
      );
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to update member role';
      toast.error('Permission denied', msg);
    },
  });

  // Member removal mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => workspaceApi.removeMember(workspaceId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
      toast.success('Member removed from workspace');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to remove member';
      toast.error('Cannot remove member', msg);
    },
  });

  const TABS: Array<{
    key: 'general' | 'members';
    label: string;
    icon: typeof Settings;
    badge?: number;
  }> = [
    { key: 'general', label: 'General', icon: Settings },
    { key: 'members', label: 'Members', icon: Users, badge: members.length || undefined },
  ];

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
              {workspace?.name ?? 'Workspace'} — Settings
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Manage your workspace configuration, member roles, and project access permissions
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isOwner ? (
              <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px' }}>
                <Crown size={12} /> Owner
              </span>
            ) : isAdmin ? (
              <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px' }}>
                <ShieldCheck size={12} /> Admin
              </span>
            ) : (
              <span className="badge badge-gray" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px' }}>
                Member
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Permission alert for non-admins */}
      {!isAdmin && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            marginBottom: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(234, 179, 8, 0.12)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            color: '#854d0e',
            fontSize: '0.8125rem',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>
            You have view-only access to this workspace&apos;s settings. Only workspace administrators or the workspace creator can invite members, assign roles, or change settings.
          </span>
        </div>
      )}

      {/* Tab Bar */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          marginBottom: '1.5rem',
        }}
      >
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: tab === t.key ? 600 : 500,
              color: tab === t.key ? 'var(--color-green-brand)' : 'var(--color-text-secondary)',
              borderBottom: tab === t.key ? '2px solid var(--color-green-brand)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'var(--transition-fast)',
            }}
          >
            <t.icon size={15} /> {t.label}
            {t.badge !== undefined && (
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: tab === t.key ? 'var(--color-green-light)' : 'rgba(0,0,0,0.06)',
                  color: tab === t.key ? 'var(--color-green-brand)' : 'var(--color-text-secondary)',
                }}
              >
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {tab === 'general' && workspace && (
        <GeneralTab workspaceId={workspaceId} workspace={workspace} isAdmin={isAdmin} />
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              {members.length} {members.length === 1 ? 'member' : 'members'} in this workspace
            </div>
            {isAdmin && (
              <Button leftIcon={<UserPlus size={15} />} onClick={() => setInviteOpen(true)} size="sm">
                Invite member
              </Button>
            )}
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            {membersLoading ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                Loading workspace members…
              </div>
            ) : members.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No members found in this workspace.
              </div>
            ) : (
              members.map((member, idx) => {
                const memberIsOwner = Boolean(workspace?.ownerId && member.userId === workspace.ownerId);
                const isSelf = member.userId === currentUser?.id;
                const memberProjectCount = member.projectIds?.length ?? 0;

                return (
                  <div
                    key={member.userId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 18px',
                      borderBottom: idx < members.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Avatar name={member.displayName || member.fullName} src={member.avatarUrl} size={38} />
                    <div style={{ flex: '1 1 200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                          {member.displayName || member.fullName}
                        </span>
                        {isSelf && (
                          <span style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: 4, background: 'rgba(0,0,0,0.06)', color: 'var(--color-text-secondary)' }}>
                            You
                          </span>
                        )}
                        {memberIsOwner && (
                          <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.68rem', padding: '2px 6px' }}>
                            <Crown size={10} /> Owner
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                        {member.email}
                      </div>
                    </div>

                    {/* Project Access Tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => isAdmin && setProjectModalMember(member)}
                        disabled={!isAdmin}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          background: memberProjectCount > 0 ? 'rgba(0, 102, 204, 0.08)' : 'rgba(0,0,0,0.05)',
                          color: memberProjectCount > 0 ? '#0066cc' : 'var(--color-text-secondary)',
                          border: '1px solid rgba(0,0,0,0.08)',
                          cursor: isAdmin ? 'pointer' : 'default',
                          transition: 'var(--transition-fast)',
                        }}
                        title={isAdmin ? 'Click to edit project access' : undefined}
                      >
                        <FolderKanban size={13} />
                        {memberProjectCount === 0
                          ? 'No project access'
                          : memberProjectCount === projects.length && projects.length > 0
                          ? 'All projects'
                          : `${memberProjectCount} ${memberProjectCount === 1 ? 'project' : 'projects'}`}
                      </button>
                    </div>

                    {/* Role Dropdown / Badge */}
                    <div style={{ minWidth: 120 }}>
                      {memberIsOwner || !isAdmin || isSelf ? (
                        <span
                          className={`badge ${
                            member.role === 'WORKSPACE_ADMIN'
                              ? 'badge-blue'
                              : member.role === 'WORKSPACE_VIEWER'
                              ? 'badge-gray'
                              : 'badge-green'
                          }`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {member.role === 'WORKSPACE_ADMIN' ? 'Admin' : member.role === 'WORKSPACE_VIEWER' ? 'Viewer' : 'Member'}
                        </span>
                      ) : (
                        <select
                          value={member.role}
                          onChange={(e) =>
                            updateRoleMutation.mutate({
                              userId: member.userId,
                              roleName: e.target.value as WorkspaceRole,
                            })
                          }
                          disabled={updateRoleMutation.isPending}
                          className="input"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="WORKSPACE_ADMIN">Admin</option>
                          <option value="WORKSPACE_MEMBER">Member</option>
                          <option value="WORKSPACE_VIEWER">Viewer</option>
                        </select>
                      )}
                    </div>

                    {/* Remove Action */}
                    {isAdmin && !memberIsOwner && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove ${member.displayName || member.fullName || member.email} from this workspace?`)) {
                            removeMemberMutation.mutate(member.userId);
                          }
                        }}
                        disabled={removeMemberMutation.isPending}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-text-secondary)',
                          borderRadius: '50%',
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'var(--transition-fast)',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-red)';
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,32,20,0.08)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
                          (e.currentTarget as HTMLButtonElement).style.background = 'none';
                        }}
                        title="Remove member"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Invite Member Modal */}
          <InviteMemberModal
            open={inviteOpen}
            onClose={() => setInviteOpen(false)}
            workspaceId={workspaceId}
            projects={projects}
          />

          {/* Manage Project Access Modal */}
          {projectModalMember && (
            <MemberProjectsModal
              open={Boolean(projectModalMember)}
              onClose={() => setProjectModalMember(null)}
              workspaceId={workspaceId}
              member={projectModalMember}
              projects={projects}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── General Tab ──────────────────────────────────────────────────
function GeneralTab({
  workspaceId,
  workspace,
  isAdmin,
}: {
  workspaceId: string;
  workspace: Workspace;
  isAdmin: boolean;
}) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateWorkspaceFormData>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: { name: workspace.name, description: workspace.description ?? '' },
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateWorkspaceFormData) => workspaceApi.update(workspaceId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace settings updated');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to update workspace';
      toast.error('Update failed', msg);
    },
  });

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '1.25rem' }}>
        Workspace Details
      </h3>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Input
          id="ws-settings-name"
          label="Workspace name *"
          disabled={!isAdmin}
          error={errors.name?.message}
          {...register('name')}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
            Workspace Key
          </label>
          <input
            type="text"
            className="input"
            value={workspace.workspaceKey}
            disabled
            style={{ opacity: 0.7, background: 'rgba(0,0,0,0.03)', cursor: 'not-allowed' }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            The workspace key is unique and cannot be modified.
          </span>
        </div>

        <Input
          id="ws-settings-desc"
          label="Description"
          disabled={!isAdmin}
          placeholder="Brief description of the workspace"
          error={errors.description?.message}
          {...register('description')}
        />

        {isAdmin && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button type="submit" loading={mutation.isPending}>
              Save changes
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

// ─── InviteMemberModal ────────────────────────────────────────────
function InviteMemberModal({
  open,
  onClose,
  workspaceId,
  projects,
}: {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  projects: Project[];
}) {
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  // Search users live autocomplete
  const { data: searchResults = [] } = useQuery({
    queryKey: ['users-search', searchQuery],
    queryFn: () => userApi.search(searchQuery).then(r => r.data ?? []),
    enabled: searchQuery.trim().length >= 2 && !selectedUser,
  });

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      roleName: 'WORKSPACE_MEMBER',
      email: '',
      userId: '',
      projectIds: [],
    },
  });

  const mutation = useMutation({
    mutationFn: (data: InviteMemberFormData) =>
      workspaceApi.inviteMember(workspaceId, {
        email: data.email || undefined,
        userId: data.userId || undefined,
        roleName: data.roleName,
        projectIds: selectedProjectIds,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
      toast.success('Member invited successfully!');
      handleClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to invite member';
      toast.error('Invitation failed', msg);
    },
  });

  const handleClose = () => {
    reset();
    setSearchQuery('');
    setSelectedUser(null);
    setSelectedProjectIds([]);
    onClose();
  };

  const handleSelectUser = (u: User) => {
    setSelectedUser(u);
    setValue('userId', u.id);
    setValue('email', u.email);
    setSearchQuery('');
  };

  const toggleProject = (pid: string) => {
    setSelectedProjectIds(prev =>
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const toggleAllProjects = () => {
    if (selectedProjectIds.length === projects.length) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(projects.map(p => p.id));
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Invite member to workspace"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            loading={mutation.isPending}
            onClick={handleSubmit(d => mutation.mutate(d))}
          >
            Send invite
          </Button>
        </>
      }
    >
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Email / User Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
            Email address or name *
          </label>

          {/* Selected User Card */}
          {selectedUser ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                border: '1.5px solid var(--color-green-accent)',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 117, 74, 0.04)',
              }}
            >
              <Avatar name={selectedUser.fullName} src={selectedUser.avatarUrl} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                  {selectedUser.fullName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  {selectedUser.email}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setSearchQuery('');
                  setValue('userId', '');
                  setValue('email', '');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-red)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              >
                ✕ Clear
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by email or name…"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  setValue('email', val);
                }}
                className="input"
                style={{ width: '100%' }}
              />

              {/* Autocomplete Suggestion Dropdown */}
              {searchResults.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    marginTop: 4,
                    maxHeight: 200,
                    overflowY: 'auto',
                  }}
                >
                  {searchResults.map(u => (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 12px',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                        transition: 'var(--transition-fast)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                    >
                      <Avatar name={u.fullName} src={u.avatarUrl} size={30} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{u.fullName}</div>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>{u.email}</div>
                      </div>
                      <Check size={14} style={{ color: 'var(--color-green-accent)', opacity: 0 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {errors.email && !selectedUser && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-red)' }}>
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Role Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
            Workspace Role *
          </label>
          <select
            {...register('roleName')}
            className="input"
            style={{ cursor: 'pointer' }}
          >
            <option value="WORKSPACE_ADMIN">Admin — Can manage settings, members, and all projects</option>
            <option value="WORKSPACE_MEMBER">Member — Can collaborate on assigned projects</option>
            <option value="WORKSPACE_VIEWER">Viewer — Can view issues and boards without editing</option>
          </select>
          {errors.roleName && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-red)' }}>
              {errors.roleName.message}
            </span>
          )}
        </div>

        {/* Project Access Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                Project Access
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Choose which projects this member can access in this workspace
              </div>
            </div>
            {projects.length > 0 && (
              <button
                type="button"
                onClick={toggleAllProjects}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  color: 'var(--color-green-accent)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {selectedProjectIds.length === projects.length ? 'Deselect all' : 'Select all'}
              </button>
            )}
          </div>

          {projects.length === 0 ? (
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              No projects created in this workspace yet.
            </div>
          ) : (
            <div
              style={{
                maxHeight: 180,
                overflowY: 'auto',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 'var(--radius-md)',
                padding: '4px',
              }}
            >
              {projects.map(p => {
                const checked = selectedProjectIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      background: checked ? 'rgba(0, 117, 74, 0.06)' : 'transparent',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleProject(p.id)}
                      style={{ accentColor: 'var(--color-green-accent)', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                      <span style={{ marginLeft: 6, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        ({p.projectKey || (p as any).key})
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

// ─── MemberProjectsModal ──────────────────────────────────────────
function MemberProjectsModal({
  open,
  onClose,
  workspaceId,
  member,
  projects,
}: {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  member: WorkspaceMember;
  projects: Project[];
}) {
  const qc = useQueryClient();
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    member.projectIds ?? []
  );

  const mutation = useMutation({
    mutationFn: (projectIds: string[]) =>
      workspaceApi.updateMemberProjects(workspaceId, member.userId, { projectIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
      toast.success('Project access updated');
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to update project access';
      toast.error('Error', msg);
    },
  });

  const toggleProject = (pid: string) => {
    setSelectedProjectIds(prev =>
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const toggleAll = () => {
    if (selectedProjectIds.length === projects.length) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(projects.map(p => p.id));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Project Access — ${member.displayName || member.fullName || member.email}`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={mutation.isPending}
            onClick={() => mutation.mutate(selectedProjectIds)}
          >
            Save access
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Select which projects <strong>{member.displayName || member.fullName}</strong> can view and participate in:
          </p>
          {projects.length > 0 && (
            <button
              type="button"
              onClick={toggleAll}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.75rem',
                color: 'var(--color-green-accent)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {selectedProjectIds.length === projects.length ? 'Deselect all' : 'Select all'}
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-secondary)', background: 'rgba(0,0,0,0.03)', borderRadius: 'var(--radius-md)' }}>
            No projects created in this workspace yet.
          </div>
        ) : (
          <div
            style={{
              maxHeight: 260,
              overflowY: 'auto',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 'var(--radius-md)',
              padding: '6px',
            }}
          >
            {projects.map(p => {
              const checked = selectedProjectIds.includes(p.id);
              return (
                <label
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    background: checked ? 'rgba(0, 117, 74, 0.06)' : 'transparent',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleProject(p.id)}
                    style={{ accentColor: 'var(--color-green-accent)', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.name}</span>
                    <span style={{ marginLeft: 6, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      ({p.projectKey || (p as any).key})
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
