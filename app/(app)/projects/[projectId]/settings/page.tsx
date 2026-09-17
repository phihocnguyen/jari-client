'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ChevronRight,
  Info,
  UserPlus,
  Trash2,
  ShieldCheck,
  Crown,
  Search,
  AlertCircle,
  Check,
  Smile,
  Rocket,
  Code2,
  LayoutGrid,
  Bug,
  Sparkles,
  Zap,
  Bell,
  Sliders,
  Layers,
  SlidersHorizontal,
  AppWindow,
  Wrench,
  HelpCircle,
} from 'lucide-react';
import { projectApi } from '@/lib/api/project';
import { userApi } from '@/lib/api/user';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import type { Project, ProjectMember, ProjectRole } from '@/types/project';
import type { User } from '@/types/auth';
import {
  updateProjectSchema,
  inviteProjectMemberSchema,
  type UpdateProjectFormData,
  type InviteProjectMemberFormData,
} from '@/lib/validations/project';

// ─── SVG Cloud Smiley Icon (Jira Default Software Space Icon) ──────
function JiraCloudSmileyIcon({ size = 48, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Cloud body */}
      <path
        d="M28 68 C22 68 18 64 18 58 C18 52.5 22 48.5 27 48 C27.5 40 34 33 43 33 C46.5 33 49.5 34.5 52 37 C56 31 63 28 70 31 C77 34 81 40 81 48 C86 48.5 90 52.5 90 58 C90 64 85 68 79 68 Z"
        fill={color}
      />
      {/* Left eye */}
      <circle cx="43" cy="50" r="2.8" fill="#0C66E4" />
      {/* Right eye */}
      <circle cx="59" cy="50" r="2.8" fill="#0C66E4" />
      {/* Cute smile */}
      <path
        d="M47 56 Q51 61 55 56"
        stroke="#E2483D"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// ─── Page Component ────────────────────────────────────────────────
export default function SpaceSettingsPage({ params }: PageProps<'/projects/[projectId]/settings'>) {
  const [resolvedParams, setResolvedParams] = useState<{ projectId: string } | null>(null);
  const [tab, setTab] = useState<'details' | 'access'>('details');

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  if (!resolvedParams) return null;

  return (
    <SpaceSettingsContent
      projectId={resolvedParams.projectId}
      tab={tab}
      setTab={setTab}
    />
  );
}

// ─── Content Component ─────────────────────────────────────────────
function SpaceSettingsContent({
  projectId,
  tab,
  setTab,
}: {
  projectId: string;
  tab: 'details' | 'access';
  setTab: (t: 'details' | 'access') => void;
}) {
  const qc = useQueryClient();
  const currentUser = useAuthStore(s => s.user);

  // Queries
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.get(projectId).then(r => r.data),
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectApi.listMembers(projectId).then(r => r.data),
  });

  // State
  const [inviteOpen, setInviteOpen] = useState(false);
  const [iconModalOpen, setIconModalOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('cloud');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Check admin rights
  const currentMember = members.find(m => m.userId === currentUser?.id);
  const isOwner = Boolean(
    (project?.leadId && currentUser?.id && project.leadId === currentUser.id) ||
    project?.role === 'PROJECT_ADMIN'
  );
  const isAdmin = Boolean(isOwner || currentMember?.role === 'PROJECT_ADMIN');

  // Resolved space key
  const spaceKey = project?.projectKey || project?.key || 'SPACE';
  const spaceName = project?.name || 'Software space';

  // Inactive Jira navigation items
  const INACTIVE_ITEMS = [
    { label: 'Notifications', hasChevron: true, icon: Bell },
    { label: 'Automation', hasChevron: false, icon: Zap },
    { label: 'Fields', hasChevron: false, icon: Sliders },
    { label: 'Work types', hasChevron: true, icon: Layers },
    { label: 'Features', hasChevron: false, icon: SlidersHorizontal },
    { label: 'Custom filters', hasChevron: false, icon: Search },
    { label: 'Toolchain', hasChevron: false, icon: Wrench },
    { label: 'Apps', hasChevron: true, icon: AppWindow },
  ];

  return (
    <div
      style={{
        display: 'flex',
        minHeight: 'calc(100vh - var(--topbar-height, 56px))',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* ─── Left Sidebar Navigation ─────────────────────────────── */}
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          borderRight: '1px solid #E5E7EB',
          backgroundColor: '#FAFBFC',
          padding: '16px 0',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
        }}
      >
        {/* Back Link to Board/Project */}
        <div style={{ padding: '0 16px 12px' }}>
          <Link
            href={`/projects/${project?.id || projectId}/board`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#44546F',
              textDecoration: 'none',
              padding: '6px 8px',
              borderRadius: 4,
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(9, 30, 66, 0.08)';
              e.currentTarget.style.color = '#172B4D';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#44546F';
            }}
          >
            <ArrowLeft size={16} />
            <span>Space settings</span>
          </Link>
        </div>

        {/* Space Identity Card */}
        <div
          style={{
            padding: '4px 16px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: '1px solid #EBECF0',
            marginBottom: 8,
          }}
        >
          {/* 36x36 Blue Rounded Icon */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: '#0C66E4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            <JiraCloudSmileyIcon size={26} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#172B4D',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={spaceName}
            >
              {spaceName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#626F86', marginTop: 1 }}>
              Software space
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' }}>
          {/* Details Tab Button */}
          <button
            onClick={() => setTab('details')}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              borderRadius: 4,
              backgroundColor: tab === 'details' ? '#E9F2FF' : 'transparent',
              color: tab === 'details' ? '#0C66E4' : '#44546F',
              fontWeight: tab === 'details' ? 600 : 400,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left',
              position: 'relative',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={e => {
              if (tab !== 'details') e.currentTarget.style.backgroundColor = 'rgba(9, 30, 66, 0.05)';
            }}
            onMouseLeave={e => {
              if (tab !== 'details') e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {tab === 'details' && (
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 6,
                  bottom: 6,
                  width: 3,
                  borderRadius: 2,
                  backgroundColor: '#0C66E4',
                }}
              />
            )}
            <span style={{ marginLeft: tab === 'details' ? 4 : 0 }}>Details</span>
          </button>

          {/* Access Tab Button */}
          <button
            onClick={() => setTab('access')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              borderRadius: 4,
              backgroundColor: tab === 'access' ? '#E9F2FF' : 'transparent',
              color: tab === 'access' ? '#0C66E4' : '#44546F',
              fontWeight: tab === 'access' ? 600 : 400,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left',
              position: 'relative',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={e => {
              if (tab !== 'access') e.currentTarget.style.backgroundColor = 'rgba(9, 30, 66, 0.05)';
            }}
            onMouseLeave={e => {
              if (tab !== 'access') e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {tab === 'access' && (
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 6,
                  bottom: 6,
                  width: 3,
                  borderRadius: 2,
                  backgroundColor: '#0C66E4',
                }}
              />
            )}
            <span style={{ marginLeft: tab === 'access' ? 4 : 0 }}>Access</span>
            {members.length > 0 && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  padding: '2px 6px',
                  borderRadius: 10,
                  backgroundColor: tab === 'access' ? '#0C66E4' : '#EBECF0',
                  color: tab === 'access' ? '#FFFFFF' : '#626F86',
                  fontWeight: 600,
                }}
              >
                {members.length}
              </span>
            )}
          </button>

          {/* Inactive Jira Items with Chevrons */}
          <div style={{ margin: '8px 0', borderTop: '1px solid #EBECF0' }} />

          {INACTIVE_ITEMS.map(item => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 4,
                color: '#626F86',
                fontSize: '0.875rem',
                cursor: 'default',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(9, 30, 66, 0.04)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {item.hasChevron && <ChevronRight size={13} style={{ color: '#8993A4' }} />}
                <span>{item.label}</span>
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* ─── Right Content Area ──────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          padding: '32px 48px 64px',
          maxWidth: 680,
          minWidth: 0,
        }}
      >
        {tab === 'details' ? (
          <DetailsTabContent
            projectId={projectId}
            project={project}
            isAdmin={isAdmin}
            onOpenIconModal={() => setIconModalOpen(true)}
          />
        ) : (
          <AccessTabContent
            projectId={projectId}
            members={members}
            membersLoading={membersLoading}
            isAdmin={isAdmin}
            currentUser={currentUser}
            onOpenInvite={() => setInviteOpen(true)}
            searchQuery={memberSearchQuery}
            setSearchQuery={setMemberSearchQuery}
          />
        )}
      </main>

      {/* ─── Change Icon Modal ───────────────────────────────────── */}
      <Modal
        open={iconModalOpen}
        onClose={() => setIconModalOpen(false)}
        title="Change space icon"
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ fontSize: '0.875rem', color: '#626F86', marginBottom: 16 }}>
            Select an icon and theme for your software space
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
              marginBottom: 20,
            }}
          >
            {[
              { id: 'cloud', label: 'Cloud', icon: JiraCloudSmileyIcon },
              { id: 'rocket', label: 'Rocket', icon: Rocket },
              { id: 'code', label: 'Code', icon: Code2 },
              { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
              { id: 'bug', label: 'Bug', icon: Bug },
              { id: 'sparkles', label: 'Features', icon: Sparkles },
            ].map(item => {
              const isSelected = selectedIcon === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedIcon(item.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '16px 12px',
                    borderRadius: 8,
                    border: isSelected ? '2px solid #0C66E4' : '1px solid #DFE1E6',
                    backgroundColor: isSelected ? '#E9F2FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      backgroundColor: '#0C66E4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                    }}
                  >
                    {item.id === 'cloud' ? (
                      <JiraCloudSmileyIcon size={32} />
                    ) : (
                      <IconComp size={24} />
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#172B4D' }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="outlined" onClick={() => setIconModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIconModalOpen(false);
                toast.success('Icon updated');
              }}
            >
              Save icon
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── Add People (Invite Member) Modal ────────────────────── */}
      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        projectId={projectId}
        existingMemberUserIds={members.map(m => m.userId)}
      />
    </div>
  );
}

// ─── Details Tab Sub-Component ─────────────────────────────────────
function DetailsTabContent({
  projectId,
  project,
  isAdmin,
  onOpenIconModal,
}: {
  projectId: string;
  project?: Project;
  isAdmin: boolean;
  onOpenIconModal: () => void;
}) {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateProjectFormData>({
    resolver: zodResolver(updateProjectSchema),
    values: {
      name: project?.name || '',
      description: project?.description || '',
      defaultAssignee: project?.defaultAssignee || 'UNASSIGNED',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProjectFormData) => projectApi.update(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', projectId] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Space details saved successfully');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to save space details';
      toast.error('Cannot save changes', msg);
    },
  });

  const onSubmit = (data: UpdateProjectFormData) => {
    if (!isAdmin) {
      toast.error('Permission denied', 'Only space admins can update settings');
      return;
    }
    updateMutation.mutate(data);
  };

  // Space owner info
  const ownerName = project?.leadName || 'hoc ng';
  const ownerInitials = ownerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'HN';

  const spaceKey = project?.projectKey || project?.key || 'ASD';

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ─── Centered Large Icon & "Change icon" ────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 28,
        }}
      >
        {/* Blue Rounded Square with Cloud Icon */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 14,
            backgroundColor: '#0C66E4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(12, 102, 228, 0.2)',
            transition: 'transform 0.15s ease',
          }}
        >
          <JiraCloudSmileyIcon size={64} />
        </div>

        {/* "Change icon" button */}
        <button
          type="button"
          onClick={onOpenIconModal}
          disabled={!isAdmin}
          style={{
            marginTop: 14,
            padding: '6px 14px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #DFE1E6',
            borderRadius: 4,
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: isAdmin ? '#172B4D' : '#8993A4',
            cursor: isAdmin ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.15s ease, border-color 0.15s ease',
          }}
          onMouseEnter={e => {
            if (isAdmin) e.currentTarget.style.backgroundColor = '#F4F5F7';
          }}
          onMouseLeave={e => {
            if (isAdmin) e.currentTarget.style.backgroundColor = '#FFFFFF';
          }}
        >
          Change icon
        </button>
      </div>

      {/* ─── Required Fields Notice ─────────────────────────────── */}
      <div
        style={{
          fontSize: '0.8125rem',
          color: '#626F86',
          marginBottom: 20,
        }}
      >
        Required fields are marked with an asterisk <span style={{ color: '#E2483D' }}>*</span>
      </div>

      {/* ─── Field: Name * ─────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <label
          htmlFor="space-name-input"
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#44546F',
            marginBottom: 6,
          }}
        >
          Name <span style={{ color: '#E2483D' }}>*</span>
        </label>
        <input
          id="space-name-input"
          type="text"
          disabled={!isAdmin}
          {...register('name')}
          style={{
            width: '100%',
            height: 40,
            padding: '0 12px',
            fontSize: '0.875rem',
            borderRadius: 4,
            border: errors.name ? '2px solid #E2483D' : '1px solid #DFE1E6',
            backgroundColor: isAdmin ? '#FFFFFF' : '#FAFBFC',
            color: '#172B4D',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
          onFocus={e => {
            if (!errors.name) {
              e.currentTarget.style.borderColor = '#0C66E4';
              e.currentTarget.style.boxShadow = '0 0 0 1px #0C66E4';
            }
          }}
          onBlur={e => {
            if (!errors.name) {
              e.currentTarget.style.borderColor = '#DFE1E6';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        />
        {errors.name && (
          <span style={{ fontSize: '0.75rem', color: '#E2483D', marginTop: 4, display: 'block' }}>
            {errors.name.message}
          </span>
        )}
      </div>

      {/* ─── Field: Space key * ────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <label
            htmlFor="space-key-input"
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#44546F',
            }}
          >
            Space key
          </label>
          <span
            title="The space key is used as the prefix for all work item keys in this space."
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#626F86',
              cursor: 'help',
            }}
          >
            <Info size={13} />
          </span>
          <span style={{ color: '#E2483D', fontSize: '0.75rem', fontWeight: 600 }}>*</span>
        </div>
        <input
          id="space-key-input"
          type="text"
          value={spaceKey}
          readOnly
          style={{
            width: '100%',
            height: 40,
            padding: '0 12px',
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            borderRadius: 4,
            border: '1px solid #DFE1E6',
            backgroundColor: '#F4F5F7',
            color: '#172B4D',
            cursor: 'not-allowed',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* ─── (Category is omitted as instructed) ───────────────── */}

      {/* ─── Field: Space owner ────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#44546F',
            marginBottom: 6,
          }}
        >
          Space owner
        </label>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            height: 44,
            padding: '0 12px',
            borderRadius: 4,
            border: '1px solid #DFE1E6',
            backgroundColor: '#FFFFFF',
            boxSizing: 'border-box',
          }}
        >
          {/* Avatar pill with Teal Background */}
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#00A3BF',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6875rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {ownerInitials}
          </div>
          <span style={{ fontSize: '0.875rem', color: '#172B4D', fontWeight: 500 }}>
            {ownerName}
          </span>
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: '#626F86',
            marginTop: 5,
            lineHeight: 1.4,
          }}
        >
          Make sure your space lead has access to work items in the space.
        </div>
      </div>

      {/* ─── Field: Default assignee ───────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <label
          htmlFor="default-assignee-select"
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#44546F',
            marginBottom: 6,
          }}
        >
          Default assignee
        </label>
        <select
          id="default-assignee-select"
          disabled={!isAdmin}
          {...register('defaultAssignee')}
          style={{
            width: '100%',
            height: 40,
            padding: '0 12px',
            fontSize: '0.875rem',
            borderRadius: 4,
            border: '1px solid #DFE1E6',
            backgroundColor: isAdmin ? '#FFFFFF' : '#FAFBFC',
            color: '#172B4D',
            outline: 'none',
            boxSizing: 'border-box',
            cursor: isAdmin ? 'pointer' : 'not-allowed',
          }}
        >
          <option value="UNASSIGNED">Unassigned</option>
          <option value="PROJECT_LEAD">Project lead</option>
        </select>
      </div>

      {/* ─── Save Button ───────────────────────────────────────── */}
      <div>
        <button
          type="submit"
          disabled={!isAdmin || (!isDirty && !updateMutation.isPending)}
          style={{
            padding: '8px 18px',
            borderRadius: 4,
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: isAdmin && isDirty ? '#0C66E4' : '#F0F1F4',
            color: isAdmin && isDirty ? '#FFFFFF' : '#8993A4',
            cursor: isAdmin && isDirty ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.15s ease, color 0.15s ease',
          }}
        >
          {updateMutation.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

// ─── Access Tab Sub-Component ──────────────────────────────────────
function AccessTabContent({
  projectId,
  members,
  membersLoading,
  isAdmin,
  currentUser,
  onOpenInvite,
  searchQuery,
  setSearchQuery,
}: {
  projectId: string;
  members: ProjectMember[];
  membersLoading: boolean;
  isAdmin: boolean;
  currentUser: User | null;
  onOpenInvite: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) {
  const qc = useQueryClient();

  // Role update mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: ProjectRole }) =>
      projectApi.updateMemberRole(projectId, userId, { roleName }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['project-members', projectId] });
      toast.success('Role updated', `Member role changed to ${res.data?.role?.replace('PROJECT_', '') ?? 'new role'}`);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to update member role';
      toast.error('Permission denied', msg);
    },
  });

  // Member removal mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectApi.removeMember(projectId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-members', projectId] });
      toast.success('Member removed from space');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to remove member';
      toast.error('Cannot remove member', msg);
    },
  });

  // Filtered members list
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase().trim();
    return members.filter(
      m =>
        m.fullName?.toLowerCase().includes(q) ||
        m.displayName?.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#172B4D', margin: '0 0 4px' }}>
              Access
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#626F86', margin: 0 }}>
              Manage members and access roles for this space
            </p>
          </div>
          {isAdmin ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 12,
                backgroundColor: '#E9F2FF',
                color: '#0C66E4',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={13} /> Space Admin
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 12,
                backgroundColor: '#F4F5F7',
                color: '#626F86',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              Member
            </span>
          )}
        </div>
      </div>

      {/* Non-admin warning banner */}
      {!isAdmin && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            marginBottom: 20,
            borderRadius: 6,
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            color: '#B45309',
            fontSize: '0.8125rem',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>Only space admins or workspace admins can add members, change roles, or remove people.</span>
        </div>
      )}

      {/* Search & Invite Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16,
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8993A4',
            }}
          />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: 36,
              paddingLeft: 32,
              paddingRight: 12,
              fontSize: '0.8125rem',
              borderRadius: 4,
              border: '1px solid #DFE1E6',
              backgroundColor: '#FFFFFF',
              color: '#172B4D',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Add people button */}
        {isAdmin && (
          <Button
            variant="primary"
            onClick={onOpenInvite}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 36,
              padding: '0 14px',
              fontSize: '0.8125rem',
            }}
          >
            <UserPlus size={14} />
            <span>Add people</span>
          </Button>
        )}
      </div>

      {/* Members List Table */}
      <div
        style={{
          borderRadius: 6,
          border: '1px solid #EBECF0',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        {membersLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#626F86', fontSize: '0.875rem' }}>
            Loading space members…
          </div>
        ) : filteredMembers.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#626F86', fontSize: '0.875rem' }}>
            {searchQuery ? 'No members match your search' : 'No members found in this space.'}
          </div>
        ) : (
          filteredMembers.map((member, idx) => {
            const isSelf = member.userId === currentUser?.id;
            const isMemberAdmin = member.role === 'PROJECT_ADMIN';

            return (
              <div
                key={member.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: idx < filteredMembers.length - 1 ? '1px solid #EBECF0' : 'none',
                  backgroundColor: isSelf ? '#FBFDFF' : 'transparent',
                }}
              >
                {/* User Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                  <Avatar
                    name={member.fullName || member.displayName || member.email}
                    src={member.avatarUrl}
                    size={36}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#172B4D' }}>
                        {member.fullName || member.displayName || member.email.split('@')[0]}
                      </span>
                      {isSelf && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            padding: '1px 6px',
                            borderRadius: 10,
                            backgroundColor: '#F4F5F7',
                            color: '#626F86',
                          }}
                        >
                          You
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#626F86' }}>{member.email}</div>
                  </div>
                </div>

                {/* Role Selector & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {isAdmin ? (
                    <select
                      value={member.role}
                      disabled={updateRoleMutation.isPending}
                      onChange={e =>
                        updateRoleMutation.mutate({
                          userId: member.userId,
                          roleName: e.target.value as ProjectRole,
                        })
                      }
                      style={{
                        height: 32,
                        padding: '0 8px',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        borderRadius: 4,
                        border: '1px solid #DFE1E6',
                        backgroundColor: '#FFFFFF',
                        color: isMemberAdmin ? '#0C66E4' : '#172B4D',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="PROJECT_ADMIN">Admin</option>
                      <option value="PROJECT_MEMBER">Member</option>
                      <option value="PROJECT_VIEWER">Viewer</option>
                    </select>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 4,
                        backgroundColor: isMemberAdmin ? '#E9F2FF' : '#F4F5F7',
                        color: isMemberAdmin ? '#0C66E4' : '#626F86',
                      }}
                    >
                      {member.role?.replace('PROJECT_', '')}
                    </span>
                  )}

                  {/* Remove button */}
                  {isAdmin && (
                    <button
                      type="button"
                      title="Remove from space"
                      disabled={removeMemberMutation.isPending}
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to remove ${member.fullName || member.email} from this space?`
                          )
                        ) {
                          removeMemberMutation.mutate(member.userId);
                        }
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        borderRadius: 4,
                        backgroundColor: 'transparent',
                        color: '#626F86',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease, color 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#FFEBE6';
                        e.currentTarget.style.color = '#DE350B';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#626F86';
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Invite Member Modal ───────────────────────────────────────────
function InviteMemberModal({
  open,
  onClose,
  projectId,
  existingMemberUserIds,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  existingMemberUserIds: string[];
}) {
  const qc = useQueryClient();
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InviteProjectMemberFormData>({
    resolver: zodResolver(inviteProjectMemberSchema),
    defaultValues: {
      roleName: 'PROJECT_MEMBER',
      email: '',
    },
  });

  // Search users API
  const { data: searchResults = [] } = useQuery({
    queryKey: ['users-search', query],
    queryFn: () => userApi.search(query).then(r => r.data),
    enabled: query.trim().length >= 2,
  });

  // Filter out users already in project
  const availableUsers = useMemo(() => {
    return searchResults.filter(u => !existingMemberUserIds.includes(u.id));
  }, [searchResults, existingMemberUserIds]);

  const addMemberMutation = useMutation({
    mutationFn: (data: InviteProjectMemberFormData) =>
      projectApi.addMember(projectId, {
        userId: selectedUser ? selectedUser.id : undefined,
        email: !selectedUser && data.email ? data.email.trim() : undefined,
        roleName: data.roleName,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-members', projectId] });
      toast.success('Person added to space');
      handleClose();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to add person to space';
      toast.error('Cannot add person', msg);
    },
  });

  const handleClose = () => {
    reset();
    setQuery('');
    setSelectedUser(null);
    onClose();
  };

  const onSubmit = (data: InviteProjectMemberFormData) => {
    addMemberMutation.mutate(data);
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add people to space">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* User Search & Email */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#44546F', marginBottom: 6 }}>
            Names or emails <span style={{ color: '#E2483D' }}>*</span>
          </label>
          {selectedUser ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid #DFE1E6',
                backgroundColor: '#F4F5F7',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={selectedUser.fullName || selectedUser.email} size={24} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#172B4D' }}>
                  {selectedUser.fullName}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#626F86' }}>({selectedUser.email})</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setValue('userId', undefined);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  color: '#0C66E4',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Clear
              </button>
            </div>
          ) : (
            <div>
              <Input
                placeholder="e.g., alex@company.com or search by name"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setValue('email', e.target.value);
                }}
                error={errors.email?.message}
              />

              {/* Autocomplete dropdown */}
              {availableUsers.length > 0 && query.trim().length >= 2 && (
                <div
                  style={{
                    marginTop: 4,
                    border: '1px solid #DFE1E6',
                    borderRadius: 4,
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    maxHeight: 180,
                    overflowY: 'auto',
                  }}
                >
                  {availableUsers.map(user => (
                    <div
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        setValue('userId', user.id);
                        setValue('email', user.email);
                        setQuery('');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F4F5F7')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Avatar name={user.fullName || user.email} size={28} />
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#172B4D' }}>
                          {user.fullName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#626F86' }}>{user.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Role Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#44546F', marginBottom: 6 }}>
            Role <span style={{ color: '#E2483D' }}>*</span>
          </label>
          <select
            {...register('roleName')}
            style={{
              width: '100%',
              height: 40,
              padding: '0 12px',
              fontSize: '0.875rem',
              borderRadius: 4,
              border: '1px solid #DFE1E6',
              backgroundColor: '#FFFFFF',
              color: '#172B4D',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          >
            <option value="PROJECT_MEMBER">Member (Can create, edit, and work on issues)</option>
            <option value="PROJECT_ADMIN">Admin (Full administrative control over space)</option>
            <option value="PROJECT_VIEWER">Viewer (Read-only access)</option>
          </select>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <Button variant="outlined" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={addMemberMutation.isPending}>
            {addMemberMutation.isPending ? 'Adding…' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
