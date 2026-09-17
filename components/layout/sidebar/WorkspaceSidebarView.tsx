'use client';

import Link from 'next/link';
import { Plus, CheckSquare, Star, ChevronDown } from 'lucide-react';
import { useNavigationLoading } from '@/components/loading';
import { WorkspaceAccordionItem } from './WorkspaceAccordionItem';
import type { Workspace } from '@/types/workspace';

interface WorkspaceSidebarViewProps {
  collapsed: boolean;
  workspaces: Workspace[];
  activeProjectId: string;
  expandedWorkspaces: Record<string, boolean>;
  onToggleWorkspace: (wsId: string) => void;
  onCreateProject: (wsId: string) => void;
  onCreateWorkspace: () => void;
  starredProjectIds: string[];
  onToggleStar: (pId: string, e?: React.MouseEvent) => void;
  starredExpanded: boolean;
  setStarredExpanded: (fn: (v: boolean) => boolean) => void;
  myOpenTasksCount: number;
}

export function WorkspaceSidebarView({
  collapsed,
  workspaces,
  activeProjectId,
  expandedWorkspaces,
  onToggleWorkspace,
  onCreateProject,
  onCreateWorkspace,
  starredProjectIds,
  onToggleStar,
  starredExpanded,
  setStarredExpanded,
  myOpenTasksCount,
}: WorkspaceSidebarViewProps) {
  const { startNavigation } = useNavigationLoading();

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

      {/* Primary Action: Create Workspace Button (No search, no create issue in workspace state) */}
      <div style={{ padding: collapsed ? '12px 8px 6px' : '12px 12px 8px', flexShrink: 0 }}>
        {collapsed ? (
          <button
            type="button"
            onClick={onCreateWorkspace}
            title="Create Workspace"
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
              margin: '0 auto',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 117, 74, 0.3)',
              transition: 'filter 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          >
            <Plus size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onCreateWorkspace}
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
              justifyContent: 'center',
              gap: 8,
              padding: '0 12px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 117, 74, 0.3)',
              transition: 'filter 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          >
            <Plus size={16} />
            <span>Create Workspace</span>
          </button>
        )}
      </div>

      {/* YOUR WORK Section */}
      {!collapsed && (
        <div
          style={{
            padding: '10px 16px 4px',
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
                  <div
                    key={proj.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: '0.8125rem',
                      marginBottom: 2,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Link
                      href={`/projects/${proj.id}/summary`}
                      onClick={() => startNavigation(`Opening ${proj.name}...`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        textDecoration: 'none',
                        color: '#fff',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
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
                          flexShrink: 0,
                        }}
                      >
                        {proj.name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {proj.name}
                      </span>
                    </Link>

                    {/* Sibling Star Button (Never nested in Link!) */}
                    <button
                      type="button"
                      onClick={e => onToggleStar(proj.id, e)}
                      title="Remove from favorites"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#FBBF24',
                        cursor: 'pointer',
                        padding: 2,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Star size={12} fill="#FBBF24" />
                    </button>
                  </div>
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
      <nav style={{ padding: '4px 0 12px', flex: 1 }}>
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
      </nav>
    </div>
  );
}
