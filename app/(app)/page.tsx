'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { workspaceApi } from '@/lib/api/workspace';
import { projectApi } from '@/lib/api/project';
import { issueApi } from '@/lib/api/issue';
import {
  Briefcase,
  FolderKanban,
  CheckCircle2,
  Plus,
  ArrowRight,
  Kanban,
  Layers,
  LayoutDashboard,
  Users,
  CheckSquare,
  AlertCircle,
  Bookmark,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import type { Project } from '@/types/project';
import type { Issue } from '@/types/issue';

function renderTypeIcon(type?: string) {
  switch (type?.toUpperCase()) {
    case 'EPIC':
      return <Zap size={14} color="#9333EA" />;
    case 'STORY':
      return <Bookmark size={14} color="#16A34A" />;
    case 'BUG':
      return <AlertCircle size={14} color="#E11D48" />;
    default:
      return <CheckSquare size={14} color="#2563EB" />;
  }
}

function formatStatus(status?: string): string {
  if (!status) return 'To Do';
  const upper = status.toUpperCase();
  if (upper === 'TODO' || upper === 'TO DO') return 'To Do';
  if (upper === 'IN_PROGRESS' || upper === 'IN PROGRESS') return 'In Progress';
  if (upper === 'IN_REVIEW' || upper === 'IN REVIEW') return 'In Review';
  if (upper === 'DONE') return 'Done';
  return status;
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');

  // Filtering for "Assigned to Me"
  const [filterWorkspaceId, setFilterWorkspaceId] = useState<string>('all');
  const [filterProjectId, setFilterProjectId] = useState<string>('all');

  // 1. Fetch user workspaces
  const { data: workspaces = [], isLoading: isWorkspacesLoading } = useQuery({
    queryKey: ['workspaces', user?.id],
    queryFn: () => workspaceApi.list(user?.id).then(r => r.data || []),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 5,
  });

  // 2. Fetch all projects across workspaces
  const { data: allProjects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ['dashboard-projects', workspaces.map(w => w.id)],
    queryFn: async () => {
      if (workspaces.length === 0) return [];
      const lists = await Promise.all(
        workspaces.map(w =>
          projectApi.list(w.id).then(r =>
            (r.data || []).map((p: Project) => ({
              ...p,
              workspaceName: w.name,
              workspaceId: w.id,
            }))
          )
        )
      );
      return lists.flat();
    },
    enabled: workspaces.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  // 3. Fetch user's assigned open issues across projects
  const { data: myIssues = [], isLoading: isIssuesLoading } = useQuery({
    queryKey: ['dashboard-my-issues', user?.id, allProjects.map(p => p.id)],
    queryFn: async () => {
      if (allProjects.length === 0) return [];
      const issueLists = await Promise.all(
        allProjects.slice(0, 10).map((p: any) =>
          issueApi.list(p.id, { size: 50 }).then(r =>
            (r.data || []).map((i: Issue) => ({
              ...i,
              projectName: p.name,
              projectId: p.id,
              workspaceId: p.workspaceId,
              workspaceName: p.workspaceName,
            }))
          )
        )
      );
      return issueLists
        .flat()
        .filter((i: any) => i.assignee?.id === user?.id && i.status !== 'DONE');
    },
    enabled: Boolean(user?.id && allProjects.length > 0),
    staleTime: 1000 * 60 * 3,
  });

  // Filtered projects based on selected workspace
  const availableProjectsForFilter = useMemo(() => {
    if (filterWorkspaceId === 'all') return allProjects;
    return allProjects.filter((p: any) => p.workspaceId === filterWorkspaceId);
  }, [allProjects, filterWorkspaceId]);

  // Filtered issues based on selected workspace and project
  const filteredIssues = useMemo(() => {
    return myIssues.filter((issue: any) => {
      const matchWs = filterWorkspaceId === 'all' || issue.workspaceId === filterWorkspaceId;
      const matchProj = filterProjectId === 'all' || issue.projectId === filterProjectId;
      return matchWs && matchProj;
    });
  }, [myIssues, filterWorkspaceId, filterProjectId]);

  const [greeting, setGreeting] = useState('Welcome back');
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const handleOpenCreateProject = (wsId?: string) => {
    const targetWsId = wsId || workspaces[0]?.id || '';
    setSelectedWorkspaceId(targetWsId);
    setCreateProjectOpen(true);
  };

  return (
    <>
      <div style={{ width: '100%', maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Hero Greeting Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--color-house-green) 0%, #152B25 100%)',
            borderRadius: 'var(--radius-card)',
            padding: '2.25rem 2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          {/* Decorative shapes */}
          <div
            style={{
              position: 'absolute',
              right: -30,
              top: -40,
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 117, 74, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1
              style={{
                color: '#fff',
                fontSize: '1.75rem',
                fontWeight: 700,
                marginBottom: '0.375rem',
                letterSpacing: '-0.02em',
              }}
            >
              {greeting}, {(user?.fullName || (user as any)?.displayName || 'User').split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem', maxWidth: 500 }}>
              Here is your workspace overview. Select a project below to jump directly into the project summary.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setCreateWorkspaceOpen(true)}
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'rgba(255,255,255,0.06)' }}
              leftIcon={<Plus size={15} />}
            >
              Workspace
            </Button>
            {workspaces.length > 0 && (
              <Button
                onClick={() => handleOpenCreateProject()}
                style={{ backgroundColor: 'var(--color-green-accent)', color: '#fff' }}
                leftIcon={<Plus size={15} />}
              >
                New Project
              </Button>
            )}
          </div>
        </div>

        {/* Real Dynamic Stats Metrics Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <StatCard
            icon={<Briefcase size={22} />}
            label="Workspaces"
            value={isWorkspacesLoading ? '—' : workspaces.length}
            color="var(--color-green-accent)"
            bg="#D4E9E2"
          />
          <StatCard
            icon={<FolderKanban size={22} />}
            label="Total Projects"
            value={isProjectsLoading ? '—' : allProjects.length}
            color="#2563EB"
            bg="#DBEAFE"
          />
          <StatCard
            icon={<CheckCircle2 size={22} />}
            label="My Open Tasks"
            value={isIssuesLoading ? '—' : myIssues.length}
            color="#D97706"
            bg="#FEF3C7"
          />
        </div>

        {/* ─── Projects / Spaces Section (Direct Access to Summary) ─── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Projects & Spaces
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                Select a project to view its summary dashboard or jump straight into the board.
              </p>
            </div>
            {workspaces.length > 0 && (
              <Button
                variant="outlined"
                onClick={() => handleOpenCreateProject()}
                leftIcon={<Plus size={14} />}
                style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
              >
                Create Project
              </Button>
            )}
          </div>

          {isProjectsLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : allProjects.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <FolderKanban size={36} style={{ color: 'var(--color-text-secondary)', margin: '0 auto 1rem', opacity: 0.6 }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No projects created yet</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Create your first project in a workspace to start managing issues and Kanban boards.
              </p>
              <Button onClick={() => handleOpenCreateProject()}>Create your first project</Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {allProjects.map(proj => (
                <div
                  key={proj.id}
                  className="card"
                  onClick={() => router.push(`/projects/${proj.id}/summary`)}
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'var(--transition-base)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div>
                    {/* Project Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}
                      >
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 10,
                            backgroundColor: proj.avatarColor || '#00754A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '0.9375rem',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                          }}
                        >
                          {(proj.projectKey || proj.name).charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: '1rem',
                              color: 'var(--color-text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {proj.name}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.05)',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {(proj as any).workspaceName || 'Workspace'}
                      </span>
                    </div>

                    {/* Description */}
                    {proj.description && (
                      <p
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.45,
                          marginBottom: '1rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {proj.description}
                      </p>
                    )}
                  </div>

                  {/* Action Links row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.875rem',
                      borderTop: '1px solid rgba(0,0,0,0.06)',
                      marginTop: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link
                        href={`/projects/${proj.id}/summary`}
                        onClick={e => e.stopPropagation()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: 'var(--color-green-light)',
                          color: 'var(--color-green-brand)',
                          padding: '4px 10px',
                          borderRadius: 6,
                          textDecoration: 'none',
                        }}
                      >
                        <LayoutDashboard size={13} />
                        <span>Summary</span>
                      </Link>
                      <Link
                        href={`/projects/${proj.id}/board`}
                        onClick={e => e.stopPropagation()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          color: 'var(--color-text-secondary)',
                          padding: '4px 8px',
                          borderRadius: 6,
                          textDecoration: 'none',
                        }}
                      >
                        <Kanban size={13} />
                        <span>Board</span>
                      </Link>
                      <Link
                        href={`/projects/${proj.id}/backlog`}
                        onClick={e => e.stopPropagation()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          color: 'var(--color-text-secondary)',
                          padding: '4px 8px',
                          borderRadius: 6,
                          textDecoration: 'none',
                        }}
                      >
                        <Layers size={13} />
                        <span>Backlog</span>
                      </Link>
                    </div>

                    <Link
                      href={`/projects/${proj.id}/summary`}
                      onClick={e => e.stopPropagation()}
                      title="Open Project Summary"
                      style={{ color: 'var(--color-green-accent)', display: 'flex', alignItems: 'center' }}
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── Workspaces Section ───────────────────────────────────── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Your Workspaces
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                Organizational containers that group your teams and projects.
              </p>
            </div>
            <Button
              variant="outlined"
              onClick={() => setCreateWorkspaceOpen(true)}
              leftIcon={<Plus size={14} />}
              style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
            >
              New Workspace
            </Button>
          </div>

          {isWorkspacesLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : workspaces.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <Briefcase size={36} style={{ color: 'var(--color-text-secondary)', margin: '0 auto 1rem', opacity: 0.6 }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No workspaces found</h3>
              <Button onClick={() => setCreateWorkspaceOpen(true)}>Create a workspace</Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {workspaces.map(ws => {
                const wsProjects = allProjects.filter(p => (p as any).workspaceId === ws.id);
                return (
                  <Link key={ws.id} href={`/workspaces/${ws.id}/projects`} style={{ textDecoration: 'none' }}>
                    <div
                      className="card"
                      style={{
                        padding: '1.25rem',
                        cursor: 'pointer',
                        transition: 'var(--transition-base)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.875rem' }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: 'var(--color-green-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-green-brand)',
                            fontWeight: 700,
                            fontSize: '1rem',
                            flexShrink: 0,
                          }}
                        >
                          {ws.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: '0.9375rem',
                              color: 'var(--color-text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {ws.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', gap: 8, marginTop: 2 }}>
                            <span>{wsProjects.length} {wsProjects.length === 1 ? 'project' : 'projects'}</span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Users size={11} /> {ws.memberCount ?? 1}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '0.625rem',
                          borderTop: '1px solid rgba(0,0,0,0.05)',
                          fontSize: '0.75rem',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        <span style={{ textTransform: 'capitalize' }}>
                          {ws.role?.replace('WORKSPACE_', '').toLowerCase() || 'Member'}
                        </span>
                        <span style={{ color: 'var(--color-green-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          View Projects <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── Assigned to Me Section (with Workspace & Project Filters) ─── */}
        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: '1rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Assigned to Me ({filteredIssues.length})
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                Open work items currently assigned to you.
              </p>
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {/* Workspace Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Workspace:
                </span>
                <select
                  value={filterWorkspaceId}
                  onChange={e => {
                    setFilterWorkspaceId(e.target.value);
                    setFilterProjectId('all');
                  }}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.8125rem',
                    borderRadius: 6,
                    border: '1px solid rgba(0,0,0,0.15)',
                    backgroundColor: '#fff',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All Workspaces ({workspaces.length})</option>
                  {workspaces.map(ws => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Project:
                </span>
                <select
                  value={filterProjectId}
                  onChange={e => setFilterProjectId(e.target.value)}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.8125rem',
                    borderRadius: 6,
                    border: '1px solid rgba(0,0,0,0.15)',
                    backgroundColor: '#fff',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All Projects ({availableProjectsForFilter.length})</option>
                  {availableProjectsForFilter.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              {myIssues.length === 0
                ? 'All caught up! No active work items assigned to you right now.'
                : 'No work items match the selected workspace and project filter.'}
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {filteredIssues.slice(0, 10).map((issue: any, idx: number) => (
                <Link
                  key={issue.id}
                  href={`/projects/${issue.projectId}/issues/${issue.key || issue.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1.25rem',
                    borderBottom: idx < Math.min(filteredIssues.length, 10) - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    {renderTypeIcon(issue.type)}
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-green-brand)', flexShrink: 0 }}>
                      {issue.key || issue.issueKey}
                    </span>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--color-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {issue.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {issue.workspaceName && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          backgroundColor: 'rgba(0,0,0,0.04)',
                          padding: '2px 7px',
                          borderRadius: 4,
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {issue.workspaceName}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        backgroundColor: 'rgba(0,0,0,0.06)',
                        padding: '2px 8px',
                        borderRadius: 4,
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {issue.projectName}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--color-green-light)',
                        color: 'var(--color-green-brand)',
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {formatStatus(issue.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <CreateWorkspaceModal open={createWorkspaceOpen} onClose={() => setCreateWorkspaceOpen(false)} />
      <CreateProjectModal
        open={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        workspaceId={selectedWorkspaceId || undefined}
      />
    </>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}) {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: 3 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
