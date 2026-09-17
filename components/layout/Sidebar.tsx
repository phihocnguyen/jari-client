'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { workspaceApi } from '@/lib/api/workspace';
import { projectApi } from '@/lib/api/project';
import { issueApi } from '@/lib/api/issue';
import { useAuthStore } from '@/store/auth.store';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal';
import { CreateIssueModal } from '@/components/issue/CreateIssueModal';
import { WorkspaceSidebarView } from './sidebar/WorkspaceSidebarView';
import { ProjectSidebarView } from './sidebar/ProjectSidebarView';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { GlobalSearchModal } from './sidebar/GlobalSearchModal';
import { KeyboardShortcutsModal } from './sidebar/KeyboardShortcutsModal';
import type { Issue } from '@/types/issue';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  projectId?: string;
  workspaceId?: string;
}

export function Sidebar({ collapsed, onToggle, projectId }: SidebarProps) {
  const pathname = usePathname();
  const currentUser = useAuthStore(s => s.user);

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
  const { data: currentProject, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', activeProjectId],
    queryFn: () => (activeProjectId ? projectApi.get(activeProjectId).then(r => r.data) : null),
    enabled: Boolean(isProjectMode && activeProjectId),
  });

  // Fetch issues to calculate user's assigned tasks count
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

  const sidebarWidth = collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';

  return (
    <>
      <aside
        className="app-sidebar"
        style={{
          width: sidebarWidth,
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
        {/* Toggle Collapse Button (Floating on right edge) */}
        <button
          type="button"
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

        {/* Subtle Top Loading Progress Bar when transitioning/fetching project */}
        {isProjectMode && isProjectLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: 'linear-gradient(90deg, #00754A, #10B981, #34D399, #00754A)',
              backgroundSize: '200% 100%',
              animation: 'sidebarProgress 1.2s linear infinite',
              zIndex: 110,
            }}
          />
        )}

        {/* ─── Sidebar Views: Project Mode vs Workspace Mode ───────── */}
        {isProjectMode && activeProjectId ? (
          <ProjectSidebarView
            collapsed={collapsed}
            projectId={activeProjectId}
            project={currentProject}
            isLoading={isProjectLoading}
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
            starredProjectIds={starredProjectIds}
            onToggleStar={toggleStarProject}
            starredExpanded={starredExpanded}
            setStarredExpanded={setStarredExpanded}
            myOpenTasksCount={myOpenTasksCount}
          />
        )}

        {/* ─── Pinned Bottom Utilities Footer ──────────────────── */}
        <SidebarFooter
          collapsed={collapsed}
          workspaces={workspaces}
          onOpenShortcuts={() => setShortcutsModalOpen(true)}
        />
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
