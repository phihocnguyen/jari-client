'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ChevronDown,
  Search,
  Settings,
  Star,
  CheckSquare,
  Kanban,
  Layers,
  HelpCircle,
  LogOut,
  ArrowLeft,
  LayoutDashboard,
  List,
  BarChart3,
  Rocket,
  Boxes,
  ChevronsUpDown,
  FolderKanban,
} from 'lucide-react';
import { workspaceApi } from '@/lib/api/workspace';
import { projectApi } from '@/lib/api/project';
import { issueApi } from '@/lib/api/issue';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal';
import { CreateIssueModal } from '@/components/issue/CreateIssueModal';
import type { Workspace } from '@/types/workspace';
import type { Project } from '@/types/project';
import type { Issue } from '@/types/issue';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  projectId?: string;
  workspaceId?: string;
}

export function Sidebar({ collapsed, onToggle, projectId, workspaceId }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  // Modals state
  const [createProjectWorkspaceId, setCreateProjectWorkspaceId] = useState<string | null>(null);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  // Accordion & Favorites state
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Record<string, boolean>>({
    'ws-demo-1': true,
  });
  const [starredProjectIds, setStarredProjectIds] = useState<string[]>([]);
  const [starredExpanded, setStarredExpanded] = useState(true);

  // Detect whether we are in "Project Mode" (inside a project route) or "Workspace Mode"
  const urlMatch = pathname.match(/\/projects\/([^\/]+)/);
  const activeProjectId = projectId || (urlMatch ? urlMatch[1] : null);
  const isProjectMode = Boolean(pathname.startsWith('/projects/') && activeProjectId);

  // Fetch all workspaces
  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceApi.list().then(r => r.data),
  });

  // Fetch current project details if in project mode
  const { data: currentProject } = useQuery({
    queryKey: ['project', activeProjectId],
    queryFn: () => (activeProjectId ? projectApi.get(activeProjectId).then(r => r.data) : null),
    enabled: Boolean(isProjectMode && activeProjectId),
  });

  // Fetch active project issues to calculate user's assigned tasks count
  const effectiveProjectId = activeProjectId || '00000000-0000-0000-0000-000000000003';
  const { data: allIssuesRes } = useQuery({
    queryKey: ['my-issues', effectiveProjectId, currentUser?.id],
    queryFn: () => issueApi.list(effectiveProjectId, { size: 100 }),
    enabled: Boolean(effectiveProjectId && currentUser?.id),
  });

  const myOpenTasksCount = useMemo(() => {
    const list = allIssuesRes?.data || [];
    return list.filter(
      (i: Issue) => i.assignee?.id === currentUser?.id && i.status !== 'DONE'
    ).length;
  }, [allIssuesRes, currentUser]);

  // Load starred projects from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jari_starred_projects');
      if (saved) setStarredProjectIds(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleStarProject = (pId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStarredProjectIds(prev => {
      const next = prev.includes(pId) ? prev.filter(id => id !== pId) : [...prev, pId];
      try {
        localStorage.setItem('jari_starred_projects', JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const toggleWorkspace = (wsId: string) => {
    setExpandedWorkspaces(prev => ({ ...prev, [wsId]: !prev[wsId] }));
  };

  // Keyboard shortcut listeners (Cmd+K / Ctrl+K, C, ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInput =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
        return;
      }

      if (isInput) return;

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setCreateIssueOpen(true);
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const w = collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';

  return (
    <>
      <aside
        className="app-sidebar"
        style={{
          width: w,
          backgroundColor: 'var(--color-house-green)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 90,
          overflow: 'visible',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '1px 0 3px rgba(0,0,0,0.15)',
        }}
      >
        {/* Toggle collapse button (Floating on right edge) */}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            position: 'absolute',
            top: 20,
            right: -12,
            width: 24,
            height: 24,
            background: 'var(--color-green-accent)',
            border: '2px solid var(--color-house-green)',
            borderRadius: '50%',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 100,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'var(--transition-base)',
          }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* ─── Sidebar Content: Render State 1 or State 2 ───────── */}
        {isProjectMode && activeProjectId ? (
          <ProjectSidebarView
            collapsed={collapsed}
            projectId={activeProjectId}
            project={currentProject}
            pathname={pathname}
            workspaces={workspaces}
            onOpenCreateIssue={() => setCreateIssueOpen(true)}
            onOpenSearch={() => setSearchModalOpen(true)}
          />
        ) : (
          <WorkspaceSidebarView
            collapsed={collapsed}
            workspaces={workspaces}
            activeProjectId={effectiveProjectId}
            expandedWorkspaces={expandedWorkspaces}
            onToggleWorkspace={toggleWorkspace}
            onCreateProject={wsId => setCreateProjectWorkspaceId(wsId)}
            onCreateWorkspace={() => setCreateWorkspaceOpen(true)}
            onOpenCreateIssue={() => setCreateIssueOpen(true)}
            onOpenSearch={() => setSearchModalOpen(true)}
            starredProjectIds={starredProjectIds}
            onToggleStar={toggleStarProject}
            starredExpanded={starredExpanded}
            setStarredExpanded={setStarredExpanded}
            myOpenTasksCount={myOpenTasksCount}
          />
        )}

        {/* ─── Pinned Bottom Utilities Footer ──────────────────── */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.12)',
            padding: collapsed ? '10px 8px' : '10px 12px',
            flexShrink: 0,
          }}
        >
          {!collapsed ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 8,
                marginBottom: 8,
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {/* Keyboard Shortcuts Dialog Trigger */}
              <button
                type="button"
                onClick={() => setShortcutsModalOpen(true)}
                title="Keyboard Shortcuts (?)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.65)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: 4,
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)')}
              >
                <HelpCircle size={14} />
                <span>Shortcuts</span>
              </button>

              {/* Workspace Settings Link */}
              {workspaces[0] && (
                <Link
                  href={`/workspaces/${workspaces[0].id}/settings`}
                  title="Workspace Settings"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'rgba(255, 255, 255, 0.65)',
                    fontSize: '0.75rem',
                    textDecoration: 'none',
                    padding: '4px 6px',
                    borderRadius: 4,
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)')}
                >
                  <Settings size={14} />
                  <span>Settings</span>
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => setShortcutsModalOpen(true)}
                title="Keyboard Shortcuts (?)"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.65)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <HelpCircle size={16} />
              </button>
            </div>
          )}

          {/* User Profile Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Avatar
                  name={currentUser?.fullName || currentUser?.email || 'User'}
                  src={currentUser?.avatarUrl}
                  size={collapsed ? 32 : 30}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 8,
                    height: 8,
                    backgroundColor: '#10B981',
                    borderRadius: '50%',
                    border: '2px solid var(--color-house-green)',
                  }}
                />
              </div>

              {!collapsed && (
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#fff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentUser?.fullName || 'My Account'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentUser?.email || 'Connected'}
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                title="Log out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.45)',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#EF4444';
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ─── Global Search Modal ─────────────────────────────── */}
      <GlobalSearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        workspaces={workspaces}
        activeProjectId={effectiveProjectId}
      />

      {/* ─── Keyboard Shortcuts Modal ────────────────────────── */}
      <KeyboardShortcutsModal
        open={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      {/* ─── Create Issue Modal ──────────────────────────────── */}
      {createIssueOpen && (
        <CreateIssueModal
          open={createIssueOpen}
          onClose={() => setCreateIssueOpen(false)}
          projectId={effectiveProjectId}
        />
      )}

      {/* ─── Create Workspace Modal ──────────────────────────── */}
      <CreateWorkspaceModal
        open={createWorkspaceOpen}
        onClose={() => setCreateWorkspaceOpen(false)}
      />

      {/* ─── Create Project Modal ────────────────────────────── */}
      {createProjectWorkspaceId && (
        <CreateProjectModal
          open={Boolean(createProjectWorkspaceId)}
          onClose={() => setCreateProjectWorkspaceId(null)}
          workspaceId={createProjectWorkspaceId}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STATE 2: ProjectSidebarView (Active When Inside a Project Route)
// ═══════════════════════════════════════════════════════════════════
function ProjectSidebarView({
  collapsed,
  projectId,
  project,
  pathname,
  workspaces,
  onOpenCreateIssue,
  onOpenSearch,
}: {
  collapsed: boolean;
  projectId: string;
  project?: Project | null;
  pathname: string;
  workspaces: Workspace[];
  onOpenCreateIssue: () => void;
  onOpenSearch: () => void;
}) {
  const projectName = project?.name || 'Teams in Space';
  const projectInitial = projectName.charAt(0).toUpperCase();

  // Project navigation items matching the horizontal tabs:
  // Summary, Board, List, Backlog, Reports, Releases, Components, Settings
  const PROJECT_NAV_ITEMS = [
    {
      id: 'summary',
      label: 'Summary',
      href: `/projects/${projectId}/summary`,
      icon: LayoutDashboard,
      isActive: pathname.includes('/summary'),
    },
    {
      id: 'board',
      label: 'Board',
      href: `/projects/${projectId}/board`,
      icon: Kanban,
      isActive: pathname.includes('/board'),
    },
    {
      id: 'list',
      label: 'List',
      href: `/projects/${projectId}/list`,
      icon: List,
      isActive: pathname.includes('/list'),
    },
    {
      id: 'backlog',
      label: 'Backlog',
      href: `/projects/${projectId}/backlog`,
      icon: Layers,
      isActive: pathname.includes('/backlog'),
    },
    {
      id: 'reports',
      label: 'Reports',
      href: `/projects/${projectId}/reports`,
      icon: BarChart3,
      isActive: pathname.includes('/reports'),
    },
    {
      id: 'releases',
      label: 'Releases',
      href: `/projects/${projectId}/releases`,
      icon: Rocket,
      isActive: pathname.includes('/releases'),
    },
    {
      id: 'components',
      label: 'Components',
      href: `/projects/${projectId}/components`,
      icon: Boxes,
      isActive: pathname.includes('/components'),
    },
    {
      id: 'settings',
      label: 'Project settings',
      href: `/projects/${projectId}/settings`,
      icon: Settings,
      isActive: pathname.includes('/settings'),
    },
  ];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* ─── Header: "← All Workspaces" + Project Title ─────── */}
      <div
        style={{
          padding: collapsed ? '14px 8px 10px' : '12px 14px 12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
        }}
      >
        {/* Back Link to Workspaces Overview */}
        <Link
          href="/"
          title="Back to all workspaces"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.65)',
            textDecoration: 'none',
            marginBottom: collapsed ? 10 : 8,
            padding: '2px 4px',
            borderRadius: 4,
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)')}
        >
          <ArrowLeft size={13} />
          {!collapsed && <span>All Workspaces</span>}
        </Link>

        {/* Project Header Block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Project Avatar Square */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: project?.avatarColor || '#00754A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.9375rem',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            {projectInitial}
          </div>

          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.45)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                PROJECTS
              </div>
              <div
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  letterSpacing: '-0.01em',
                }}
                title={projectName}
              >
                {projectName}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Quick Actions: Create Issue & Search ───────────── */}
      <div style={{ padding: collapsed ? '12px 8px 6px' : '12px 12px 6px', flexShrink: 0 }}>
        {/* Create Issue button */}
        {collapsed ? (
          <button
            onClick={onOpenCreateIssue}
            title="Create Issue (C)"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: 'var(--color-green-accent)',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 117, 74, 0.3)',
            }}
          >
            <Plus size={18} />
          </button>
        ) : (
          <button
            onClick={onOpenCreateIssue}
            style={{
              width: '100%',
              height: 36,
              borderRadius: 8,
              backgroundColor: 'var(--color-green-accent)',
              border: 'none',
              color: '#fff',
              fontSize: '0.8125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              marginBottom: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 117, 74, 0.3)',
              transition: 'filter 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} />
              <span>Create Issue</span>
            </div>
            <kbd
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                borderRadius: 4,
                padding: '2px 6px',
                fontSize: '0.6875rem',
                fontWeight: 700,
              }}
            >
              C
            </kbd>
          </button>
        )}

        {/* Search button */}
        {collapsed ? (
          <button
            onClick={onOpenSearch}
            title="Search (⌘K)"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              cursor: 'pointer',
            }}
          >
            <Search size={16} />
          </button>
        ) : (
          <button
            onClick={onOpenSearch}
            style={{
              width: '100%',
              height: 32,
              borderRadius: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.65)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={14} />
              <span>Search…</span>
            </div>
            <kbd
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                borderRadius: 3,
                padding: '1px 5px',
                fontSize: '0.6875rem',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* ─── Project Navigation Links (Summary, Board, List, Backlog...) */}
      <nav style={{ padding: '8px 8px', flex: 1 }}>
        {!collapsed && (
          <div
            style={{
              padding: '4px 8px 6px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.4)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            PLANNING & WORK
          </div>
        )}

        {PROJECT_NAV_ITEMS.map(item => {
          const IconComp = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 10,
                padding: collapsed ? '9px 0' : '8px 12px',
                borderRadius: 8,
                backgroundColor: item.isActive ? 'var(--color-green-accent)' : 'transparent',
                color: item.isActive ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                fontWeight: item.isActive ? 600 : 400,
                fontSize: '0.8125rem',
                textDecoration: 'none',
                marginBottom: 2,
                position: 'relative',
                transition: 'background-color 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!item.isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
              onMouseLeave={e => {
                if (!item.isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <IconComp size={17} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STATE 1: WorkspaceSidebarView (Active When Outside of Project)
// ═══════════════════════════════════════════════════════════════════
function WorkspaceSidebarView({
  collapsed,
  workspaces,
  activeProjectId,
  expandedWorkspaces,
  onToggleWorkspace,
  onCreateProject,
  onCreateWorkspace,
  onOpenCreateIssue,
  onOpenSearch,
  starredProjectIds,
  onToggleStar,
  starredExpanded,
  setStarredExpanded,
  myOpenTasksCount,
}: {
  collapsed: boolean;
  workspaces: Workspace[];
  activeProjectId: string;
  expandedWorkspaces: Record<string, boolean>;
  onToggleWorkspace: (wsId: string) => void;
  onCreateProject: (wsId: string) => void;
  onCreateWorkspace: () => void;
  onOpenCreateIssue: () => void;
  onOpenSearch: () => void;
  starredProjectIds: string[];
  onToggleStar: (pId: string, e?: React.MouseEvent) => void;
  starredExpanded: boolean;
  setStarredExpanded: (fn: (v: boolean) => boolean) => void;
  myOpenTasksCount: number;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0 12px' : '0 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              flexShrink: 0,
              background: 'var(--color-green-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1rem',
              transform: 'rotate(45deg)',
              boxShadow: '0 2px 6px rgba(0, 117, 74, 0.4)',
            }}
          >
            <span style={{ transform: 'rotate(-45deg)' }}>J</span>
          </div>
          {!collapsed && (
            <span
              style={{
                fontWeight: 700,
                fontSize: '1.125rem',
                color: '#fff',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              Jari
            </span>
          )}
        </Link>
      </div>

      {/* Action Utilities (Search & Create Issue) */}
      <div style={{ padding: collapsed ? '12px 8px 6px' : '12px 12px 8px', flexShrink: 0 }}>
        {collapsed ? (
          <button
            onClick={onOpenCreateIssue}
            title="Create Issue (C)"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: 'var(--color-green-accent)',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 117, 74, 0.3)',
            }}
          >
            <Plus size={18} />
          </button>
        ) : (
          <button
            onClick={onOpenCreateIssue}
            style={{
              width: '100%',
              height: 36,
              borderRadius: 8,
              backgroundColor: 'var(--color-green-accent)',
              border: 'none',
              color: '#fff',
              fontSize: '0.8125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              marginBottom: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 117, 74, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} />
              <span>Create Issue</span>
            </div>
            <kbd
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                borderRadius: 4,
                padding: '2px 6px',
                fontSize: '0.6875rem',
                fontWeight: 700,
              }}
            >
              C
            </kbd>
          </button>
        )}

        {/* Global Search Button */}
        {collapsed ? (
          <button
            onClick={onOpenSearch}
            title="Search (⌘K)"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              cursor: 'pointer',
            }}
          >
            <Search size={16} />
          </button>
        ) : (
          <button
            onClick={onOpenSearch}
            style={{
              width: '100%',
              height: 34,
              borderRadius: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.65)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={14} />
              <span>Search…</span>
            </div>
            <kbd
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                borderRadius: 3,
                padding: '1px 5px',
                fontSize: '0.6875rem',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* YOUR WORK Section */}
      {!collapsed && (
        <div
          style={{
            padding: '12px 16px 4px',
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          YOUR WORK
        </div>
      )}

      <div style={{ padding: '0 8px 6px' }}>
        <Link
          href={`/projects/${activeProjectId}/board?assignee=me`}
          title="My Assigned Tasks"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '8px 0' : '7px 10px',
            borderRadius: 8,
            color: 'rgba(255, 255, 255, 0.85)',
            textDecoration: 'none',
            fontSize: '0.8125rem',
            fontWeight: 500,
            marginBottom: 2,
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckSquare size={16} color="var(--color-green-light)" />
            {!collapsed && <span>My Issues</span>}
          </div>
          {!collapsed && myOpenTasksCount > 0 && (
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 10,
              }}
            >
              {myOpenTasksCount}
            </span>
          )}
        </Link>
      </div>

      {/* Starred Section */}
      {!collapsed && starredProjectIds.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div
            onClick={() => setStarredExpanded(v => !v)}
            style={{
              padding: '6px 16px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.4)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={11} fill="#FBBF24" color="#FBBF24" />
              <span>STARRED ({starredProjectIds.length})</span>
            </div>
            <ChevronDown
              size={12}
              style={{
                transform: starredExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.15s ease',
              }}
            />
          </div>

          {starredExpanded && (
            <div style={{ padding: '0 8px' }}>
              {workspaces
                .flatMap(ws => (ws as any).projects || [])
                .filter(p => starredProjectIds.includes(p.id))
                .map(proj => (
                  <Link
                    key={proj.id}
                    href={`/projects/${proj.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: 6,
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: '0.8125rem',
                      marginBottom: 2,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          backgroundColor: proj.avatarColor || '#EAB308',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.625rem',
                          fontWeight: 700,
                        }}
                      >
                        {proj.name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {proj.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={e => onToggleStar(proj.id, e)}
                      style={{ background: 'none', border: 'none', color: '#FBBF24', cursor: 'pointer' }}
                    >
                      <Star size={12} fill="#FBBF24" />
                    </button>
                  </Link>
                ))}
            </div>
          )}
        </div>
      )}

      {/* WORKSPACES Section */}
      {!collapsed && (
        <div
          style={{
            padding: '12px 16px 6px',
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <span>WORKSPACES ({workspaces.length})</span>
        </div>
      )}

      {/* Workspaces List */}
      <nav style={{ padding: '4px 0', flex: 1 }}>
        {workspaces.map((ws: Workspace) => (
          <WorkspaceAccordionItem
            key={ws.id}
            workspace={ws}
            collapsed={collapsed}
            activeProjectId={activeProjectId}
            isExpanded={expandedWorkspaces[ws.id] ?? true}
            onToggleExpand={() => onToggleWorkspace(ws.id)}
            onCreateProject={() => onCreateProject(ws.id)}
            starredProjectIds={starredProjectIds}
            onToggleStar={onToggleStar}
          />
        ))}

        {/* "+ Create Workspace" Button */}
        {collapsed ? (
          <button
            onClick={onCreateWorkspace}
            title="Create Workspace"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px dashed rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '12px auto 8px',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
          </button>
        ) : (
          <button
            onClick={onCreateWorkspace}
            style={{
              width: 'calc(100% - 16px)',
              margin: '8px 8px 12px',
              padding: '7px 12px',
              borderRadius: 8,
              background: 'transparent',
              border: '1px dashed rgba(255,255,255,0.25)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            <span>Create Workspace</span>
          </button>
        )}
      </nav>
    </div>
  );
}

// ─── WorkspaceAccordionItem Sub-Component ──────────────────────────
function WorkspaceAccordionItem({
  workspace,
  collapsed,
  activeProjectId,
  isExpanded,
  onToggleExpand,
  onCreateProject,
  starredProjectIds,
  onToggleStar,
}: {
  workspace: Workspace;
  collapsed: boolean;
  activeProjectId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCreateProject: () => void;
  starredProjectIds: string[];
  onToggleStar: (pId: string, e?: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', workspace.id],
    queryFn: () => projectApi.list(workspace.id).then(r => r.data),
  });

  return (
    <div style={{ marginBottom: 6 }}>
      {/* Workspace Header Row */}
      <div
        onClick={onToggleExpand}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '6px 0' : '6px 12px',
          marginInline: collapsed ? 0 : 6,
          borderRadius: 8,
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.9)',
          transition: 'var(--transition-fast)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1, overflow: 'hidden' }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              flexShrink: 0,
              backgroundColor: 'var(--color-green-light)',
              color: 'var(--color-green-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.8125rem',
            }}
          >
            {workspace.name.charAt(0).toUpperCase()}
          </div>

          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <span
                title={workspace.name}
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                }}
              >
                {workspace.name}
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 6 }}>
            {/* Quick Workspace Settings Cog */}
            <Link
              href={`/workspaces/${workspace.id}/settings`}
              onClick={e => e.stopPropagation()}
              title={`Settings for ${workspace.name}`}
              style={{
                display: hovered ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22,
                height: 22,
                borderRadius: 4,
                color: 'rgba(255, 255, 255, 0.7)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                textDecoration: 'none',
              }}
            >
              <Settings size={12} />
            </Link>

            {/* Create Project (+) Button */}
            <button
              onClick={e => {
                e.stopPropagation();
                onCreateProject();
              }}
              style={{
                background: hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: 4,
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
              }}
              title={`Create project in ${workspace.name}`}
            >
              <Plus size={13} />
            </button>

            {/* Expand / Collapse Chevron */}
            <ChevronDown
              size={13}
              color="rgba(255,255,255,0.5)"
              style={{
                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s',
              }}
            />
          </div>
        )}
      </div>

      {/* Child Projects List */}
      {isExpanded && (
        <div style={{ marginTop: 2 }}>
          {projects.map((proj: Project) => {
            const isProjectActive = activeProjectId === proj.id;
            const isStarred = starredProjectIds.includes(proj.id);

            return (
              <ProjectSidebarItem
                key={proj.id}
                project={proj}
                isActive={isProjectActive}
                collapsed={collapsed}
                isStarred={isStarred}
                onToggleStar={e => onToggleStar(proj.id, e)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── ProjectSidebarItem Sub-Component ──────────────────────────────
function ProjectSidebarItem({
  project,
  isActive,
  collapsed,
  isStarred,
  onToggleStar,
}: {
  project: Project;
  isActive: boolean;
  collapsed: boolean;
  isStarred: boolean;
  onToggleStar: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        marginInline: collapsed ? 0 : 6,
        marginBottom: 2,
        borderRadius: 8,
        backgroundColor: isActive ? 'rgba(0, 117, 74, 0.45)' : hovered ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
        transition: 'background-color 0.15s ease',
      }}
    >
      <Link
        href={`/projects/${project.id}/board`}
        title={project.name}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '6px 0' : '6px 10px 6px 32px',
          textDecoration: 'none',
          position: 'relative',
        }}
      >
        {isActive && !collapsed && (
          <span
            style={{
              position: 'absolute',
              left: 18,
              top: 8,
              bottom: 8,
              width: 3,
              borderRadius: 2,
              backgroundColor: 'var(--color-green-accent)',
            }}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: project.avatarColor || '#EAB308',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.625rem',
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>

          {!collapsed && (
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: isActive ? 600 : 400,
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {project.name}
            </span>
          )}
        </div>

        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {(hovered || isStarred) && (
              <button
                type="button"
                onClick={onToggleStar}
                title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 2,
                  cursor: 'pointer',
                  color: isStarred ? '#FBBF24' : 'rgba(255, 255, 255, 0.4)',
                }}
              >
                <Star size={12} fill={isStarred ? '#FBBF24' : 'none'} />
              </button>
            )}

            {hovered && (
              <Link
                href={`/projects/${project.id}/settings`}
                title="Space settings"
                onClick={e => e.stopPropagation()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'rgba(255, 255, 255, 0.5)',
                  padding: 2,
                }}
              >
                <Settings size={12} />
              </Link>
            )}
          </div>
        )}
      </Link>
    </div>
  );
}

// ─── Global Search Modal ───────────────────────────────────────────
function GlobalSearchModal({
  open,
  onClose,
  workspaces,
  activeProjectId,
}: {
  open: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  activeProjectId: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  // Query issues in active project
  const { data: issuesRes } = useQuery({
    queryKey: ['search-issues', activeProjectId, query],
    queryFn: () => issueApi.list(activeProjectId, { query: query, size: 8 }),
    enabled: open && query.trim().length >= 1,
  });

  const issues = issuesRes?.data || [];

  const matchingProjects = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const allProj: Array<{ id: string; name: string; key: string; workspaceName: string }> = [];
    workspaces.forEach(ws => {
      ((ws as any).projects || []).forEach((p: any) => {
        if (
          p.name?.toLowerCase().includes(q) ||
          p.projectKey?.toLowerCase().includes(q) ||
          p.key?.toLowerCase().includes(q)
        ) {
          allProj.push({ id: p.id, name: p.name, key: p.projectKey || p.key, workspaceName: ws.name });
        }
      });
    });
    return allProj;
  }, [workspaces, query]);

  const matchingWorkspaces = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return workspaces.filter(
      w => w.name.toLowerCase().includes(q) || w.workspaceKey?.toLowerCase().includes(q)
    );
  }, [workspaces, query]);

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <Modal open={open} onClose={onClose} title="Search Jari">
      <div style={{ padding: '0 0 8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            border: '1px solid #DFE1E6',
            borderRadius: 6,
            backgroundColor: '#FAFBFC',
            marginBottom: 16,
          }}
        >
          <Search size={18} color="#626F86" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects, issues, or workspaces…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.9375rem',
              color: '#172B4D',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.75rem',
                color: '#626F86',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {/* Matching Issues */}
          {issues.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#626F86',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 6,
                }}
              >
                Issues ({issues.length})
              </div>
              {issues.map((issue: Issue) => (
                <div
                  key={issue.id}
                  onClick={() => handleNavigate(`/projects/${activeProjectId}/board?issue=${issue.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F4F5F7')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: '#0C66E4' }}>{issue.key}</span>
                    <span style={{ color: '#172B4D' }}>{issue.title}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: '#EBECF0',
                      color: '#44546F',
                    }}
                  >
                    {issue.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Matching Projects */}
          {matchingProjects.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#626F86',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 6,
                }}
              >
                Projects ({matchingProjects.length})
              </div>
              {matchingProjects.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleNavigate(`/projects/${p.id}/board`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F4F5F7')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FolderKanban size={16} color="#00754A" />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: '#172B4D' }}>{p.name}</span>
                    <span style={{ color: '#626F86', marginLeft: 6 }}>({p.key})</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#626F86' }}>{p.workspaceName}</span>
                </div>
              ))}
            </div>
          )}

          {/* Matching Workspaces */}
          {matchingWorkspaces.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#626F86',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 6,
                }}
              >
                Workspaces ({matchingWorkspaces.length})
              </div>
              {matchingWorkspaces.map(w => (
                <div
                  key={w.id}
                  onClick={() => handleNavigate(`/workspaces/${w.id}/settings`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F4F5F7')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Settings size={16} color="#626F86" />
                  <span style={{ fontWeight: 600, color: '#172B4D' }}>{w.name}</span>
                  <span style={{ color: '#626F86' }}>({w.workspaceKey})</span>
                </div>
              ))}
            </div>
          )}

          {query.trim() &&
            !matchingProjects.length &&
            !matchingWorkspaces.length &&
            !issues.length && (
              <div style={{ padding: '24px', textAlign: 'center', color: '#626F86', fontSize: '0.875rem' }}>
                No results found for &ldquo;{query}&rdquo;
              </div>
            )}
        </div>
      </div>
    </Modal>
  );
}

// ─── Keyboard Shortcuts Modal ──────────────────────────────────────
function KeyboardShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const SHORTCUTS = [
    {
      group: 'Actions',
      items: [
        { key: 'C', description: 'Create a new issue' },
        { key: '⌘K / Ctrl+K', description: 'Open search palette' },
        { key: '?', description: 'Show keyboard shortcuts' },
      ],
    },
    {
      group: 'Navigation',
      items: [
        { key: 'B', description: 'Go to Active Board' },
        { key: 'L', description: 'Go to Backlog' },
        { key: 'S', description: 'Go to Project settings' },
      ],
    },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts">
      <div style={{ padding: '4px 0 8px' }}>
        <p style={{ fontSize: '0.8125rem', color: '#626F86', marginBottom: 16 }}>
          Boost your productivity in Jari with quick keyboard actions.
        </p>

        {SHORTCUTS.map(sec => (
          <div key={sec.group} style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#626F86',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 8,
              }}
            >
              {sec.group}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sec.items.map(item => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 4,
                    backgroundColor: '#F4F5F7',
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', color: '#172B4D' }}>{item.description}</span>
                  <kbd
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #DFE1E6',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#172B4D',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                    }}
                  >
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
