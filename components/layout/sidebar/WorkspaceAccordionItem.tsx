'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, ChevronDown, Settings } from 'lucide-react';
import { projectApi } from '@/lib/api/project';
import { ProjectSidebarItem } from './ProjectSidebarItem';
import type { Workspace } from '@/types/workspace';
import type { Project } from '@/types/project';

interface WorkspaceAccordionItemProps {
  workspace: Workspace;
  collapsed: boolean;
  activeProjectId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCreateProject: () => void;
  starredProjectIds: string[];
  onToggleStar: (pId: string, e?: React.MouseEvent) => void;
}

export function WorkspaceAccordionItem({
  workspace,
  collapsed,
  activeProjectId,
  isExpanded,
  onToggleExpand,
  onCreateProject,
  starredProjectIds,
  onToggleStar,
}: WorkspaceAccordionItemProps) {
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            minWidth: 0,
            flex: 1,
            overflow: 'hidden',
          }}
        >
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flexShrink: 0,
              marginLeft: 6,
            }}
          >
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
              type="button"
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
