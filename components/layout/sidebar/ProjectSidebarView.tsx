'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Search,
  LayoutDashboard,
  Kanban,
  List,
  Layers,
  BarChart3,
  Rocket,
  Boxes,
  Settings,
} from 'lucide-react';
import type { Project } from '@/types/project';
import type { Workspace } from '@/types/workspace';

interface ProjectSidebarViewProps {
  collapsed: boolean;
  projectId: string;
  project?: Project | null;
  isLoading?: boolean;
  pathname: string;
  workspaces: Workspace[];
  onOpenCreateIssue: () => void;
  onOpenSearch: () => void;
}

export function ProjectSidebarView({
  collapsed,
  projectId,
  project,
  isLoading,
  pathname,
  onOpenCreateIssue,
  onOpenSearch,
}: ProjectSidebarViewProps) {
  const projectName = project?.name || (isLoading ? '' : 'Teams in Space');
  const projectInitial = projectName ? projectName.charAt(0).toUpperCase() : 'T';

  // Project navigation items matching the tabs:
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
        animation: 'sidebarSlideFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style>{`
        @keyframes sidebarSlideFadeIn {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes sidebarPulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.85; }
        }
      `}</style>

      {/* ─── Header: "← All Workspaces" + Project Title ─────── */}
      <div
        style={{
          padding: collapsed ? '12px 0 10px' : '12px 14px 12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: collapsed ? 'center' : 'stretch',
        }}
      >
        {/* Back Link to Workspaces Overview */}
        <Link
          href="/"
          title="Back to all workspaces"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: collapsed ? 0 : 6,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.65)',
            textDecoration: 'none',
            marginBottom: collapsed ? 8 : 8,
            padding: collapsed ? '4px' : '2px 4px',
            borderRadius: 6,
            width: collapsed ? 28 : undefined,
            height: collapsed ? 28 : undefined,
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)')}
        >
          <ArrowLeft size={14} />
          {!collapsed && <span>All Workspaces</span>}
        </Link>

        {/* Project Header Block */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 10, width: '100%' }}>
          {isLoading && !project ? (
            /* Skeleton Loading State for Project Header */
            <>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  animation: 'sidebarPulse 1.5s infinite ease-in-out',
                  flexShrink: 0,
                }}
              />
              {!collapsed && (
                <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div
                    style={{
                      width: 55,
                      height: 9,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      animation: 'sidebarPulse 1.5s infinite ease-in-out',
                    }}
                  />
                  <div
                    style={{
                      width: 120,
                      height: 14,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.18)',
                      animation: 'sidebarPulse 1.5s infinite ease-in-out',
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* ─── Quick Actions: Create Issue & Search (inside Project State) ── */}
      <div style={{ padding: collapsed ? '12px 8px 6px' : '12px 12px 6px', flexShrink: 0 }}>
        {/* Create Issue button */}
        {collapsed ? (
          <button
            type="button"
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
            type="button"
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
            type="button"
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
            type="button"
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
