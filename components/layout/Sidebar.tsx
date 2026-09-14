'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft, ChevronRight, Plus, ChevronDown, Folder,
} from 'lucide-react';
import { workspaceApi } from '@/lib/api/workspace';
import { projectApi } from '@/lib/api/project';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal';
import type { Workspace } from '@/types/workspace';
import type { Project } from '@/types/project';

interface SidebarProps {
  collapsed:   boolean;
  onToggle:    () => void;
  projectId?:  string;
  workspaceId?: string;
}

export function Sidebar({ collapsed, onToggle, projectId }: SidebarProps) {
  const pathname = usePathname();
  const [createProjectWorkspaceId, setCreateProjectWorkspaceId] = useState<string | null>(null);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Record<string, boolean>>({ 'ws-demo-1': true });

  // Fetch all workspaces
  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceApi.list().then(r => r.data),
  });

  // Extract active project ID from URL
  const urlMatch = pathname.match(/\/projects\/([^\/]+)/);
  const activeProjectId = projectId || (urlMatch ? urlMatch[1] : 'proj-demo-1');

  const toggleWorkspace = (wsId: string) => {
    setExpandedWorkspaces(prev => ({ ...prev, [wsId]: !prev[wsId] }));
  };

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
          overflow: 'visible',
        }}
      >
        {/* Top Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'visible', position: 'relative' }}>
          {/* Brand Header */}
          <div style={{
            height: 'var(--topbar-height)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: collapsed ? '0 12px' : '0 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
            position: 'relative',
          }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              {/* Diamond Logo */}
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'var(--color-green-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: '1rem',
                transform: 'rotate(45deg)',
              }}>
                <span style={{ transform: 'rotate(-45deg)' }}>J</span>
              </div>
              {!collapsed && (
                <span style={{
                  fontWeight: 700, fontSize: '1.125rem', color: '#fff',
                  letterSpacing: '-0.02em', whiteSpace: 'nowrap',
                }}>
                  Jari
                </span>
              )}
            </Link>
          </div>

          {/* Toggle collapse button */}
          <button
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              position: 'absolute', top: 20, right: -12,
              width: 24, height: 24,
              background: 'var(--color-green-accent)',
              border: '2px solid var(--color-house-green)',
              borderRadius: '50%',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 100,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'var(--transition-base)',
            }}
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>

          {/* WORKSPACES Section Header */}
          {!collapsed && (
            <div style={{
              padding: '16px 16px 6px',
              fontSize: '0.6875rem', fontWeight: 700,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <span>WORKSPACES ({workspaces.length})</span>
            </div>
          )}

          {/* Workspaces Accordion & Projects List */}
          <nav style={{ padding: '8px 0', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {workspaces.map((ws: Workspace) => (
              <WorkspaceAccordionItem
                key={ws.id}
                workspace={ws}
                collapsed={collapsed}
                activeProjectId={activeProjectId}
                isExpanded={expandedWorkspaces[ws.id] ?? true}
                onToggleExpand={() => toggleWorkspace(ws.id)}
                onCreateProject={() => setCreateProjectWorkspaceId(ws.id)}
              />
            ))}

            {/* Discord style "+" Add Workspace item for collapsed or expanded list */}
            {collapsed ? (
              <button
                onClick={() => setCreateWorkspaceOpen(true)}
                title="Create Workspace"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px dashed rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  margin: '8px auto',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--color-green-accent)';
                  e.currentTarget.style.borderStyle = 'solid';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderStyle = 'dashed';
                }}
              >
                <Plus size={16} />
              </button>
            ) : (
              <button
                onClick={() => setCreateWorkspaceOpen(true)}
                style={{
                  width: 'calc(100% - 16px)',
                  margin: '8px 8px 0',
                  padding: '8px 12px',
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
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'var(--color-green-accent)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                }}
              >
                <Plus size={14} />
                <span>Create Workspace</span>
              </button>
            )}
          </nav>
        </div>
      </aside>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        open={createWorkspaceOpen}
        onClose={() => setCreateWorkspaceOpen(false)}
      />

      {/* Create Project Modal */}
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

// ─── WorkspaceAccordionItem Sub-Component ──────────────────────────
function WorkspaceAccordionItem({
  workspace, collapsed, activeProjectId, isExpanded, onToggleExpand, onCreateProject,
}: {
  workspace: Workspace;
  collapsed: boolean;
  activeProjectId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCreateProject: () => void;
}) {
  // Query projects belonging to this workspace
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', workspace.id],
    queryFn: () => projectApi.list(workspace.id).then(r => r.data),
  });

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Workspace Header Row */}
      <div
        onClick={onToggleExpand}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '6px 0' : '6px 12px',
          marginInline: collapsed ? 0 : 6,
          borderRadius: 8,
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.9)',
          transition: 'var(--transition-fast)',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {/* Workspace Avatar */}
          <div style={{
            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
            backgroundColor: 'var(--color-green-light)', color: 'var(--color-green-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.8125rem',
          }}>
            {workspace.name.charAt(0).toUpperCase()}
          </div>

          {!collapsed && (
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {workspace.name}
            </span>
          )}
        </div>

        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Create Project (+) Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateProject();
              }}
              style={{
                background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 4,
                width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', cursor: 'pointer',
              }}
              title={`Create project in ${workspace.name}`}
            >
              <Plus size={14} />
            </button>

            {/* Expand / Collapse Chevron */}
            <ChevronDown
              size={14}
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

            return (
              <Link
                key={proj.id}
                href={`/projects/${proj.id}`}
                title={collapsed ? proj.name : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '6px 0' : '6px 12px 6px 36px',
                  marginInline: collapsed ? 0 : 6,
                  marginBottom: 2,
                  borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  if (!isProjectActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={e => {
                  if (!isProjectActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {collapsed ? (
                  /* Collapsed 32px Circular Icon (No Overflow Bug) */
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    backgroundColor: isProjectActive ? 'var(--color-green-accent)' : (proj.avatarColor || '#EAB308'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.75rem', fontWeight: 800,
                    margin: '2px auto',
                  }}>
                    {proj.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  /* Expanded Row Styling */
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    backgroundColor: isProjectActive ? 'var(--color-green-accent)' : 'transparent',
                    padding: '6px 10px', borderRadius: 8,
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      backgroundColor: proj.avatarColor || '#EAB308',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '0.6875rem', fontWeight: 800,
                    }}>
                      {proj.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{
                      fontSize: '0.8125rem', fontWeight: isProjectActive ? 700 : 500,
                      color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {proj.name}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
