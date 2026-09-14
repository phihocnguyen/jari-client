'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Settings, ChevronLeft, ChevronRight,
  FolderKanban, BarChart3, Tag, Layers, AlertCircle,
  Plus, Grid, Rocket, PieChart, PlayCircle, Folder, Briefcase,
  ChevronDown, ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { projectApi } from '@/lib/api/project';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth.store';
import type { Project } from '@/types/project';

interface SidebarProps {
  collapsed:   boolean;
  onToggle:    () => void;
  projectId?:  string;
  workspaceId?: string;
}

export function Sidebar({ collapsed, onToggle, projectId, workspaceId }: SidebarProps) {
  const pathname = usePathname();
  const user     = useAuthStore(s => s.user);

  // Fetch existing projects from workspace
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => projectApi.list(workspaceId || 'ws-demo-1').then(r => r.data),
  });

  // Extract active project ID from URL if not passed explicitly
  const urlMatch = pathname.match(/\/projects\/([^\/]+)/);
  const activeProjectId = projectId || (urlMatch ? urlMatch[1] : projects[0]?.id || 'proj-demo-1');

  const w = collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';

  return (
    <aside
      className="app-sidebar"
      style={{
        width: w,
        backgroundColor: 'var(--color-house-green)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top Section */}
      <div>
        {/* Brand & Quick Actions Header */}
        <div style={{
          height: 'var(--topbar-height)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: collapsed ? '0 12px' : '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
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

          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link href="/workspaces">
                <button
                  style={{
                    background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 6,
                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', cursor: 'pointer',
                  }}
                  title="Workspaces"
                >
                  <Briefcase size={16} />
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Toggle collapse button */}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            position: 'absolute', top: 76, right: -12,
            width: 24, height: 24,
            background: 'var(--color-green-accent)',
            border: '2px solid var(--color-house-green)',
            borderRadius: '50%',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 50,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'var(--transition-base)',
          }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* PROJECTS Section Header */}
        {!collapsed && (
          <div style={{
            padding: '16px 16px 6px',
            fontSize: '0.6875rem', fontWeight: 700,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>PROJECTS ({projects.length})</span>
          </div>
        )}

        {/* Dynamic List of Existing Projects */}
        <nav style={{ padding: '8px 0', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {projects.map((proj: Project) => {
            const isProjectActive = activeProjectId === proj.id;
            const projectKey = proj.projectKey || proj.key || 'PROJ';

            const subNavItems = [
              { href: `/projects/${proj.id}/summary`,    label: 'Summary',    icon: PieChart },
              { href: `/projects/${proj.id}/board`,      label: 'Board',      icon: LayoutDashboard },
              { href: `/projects/${proj.id}/backlog`,    label: 'Backlog',    icon: FolderKanban },
              { href: `/projects/${proj.id}/issues`,     label: 'Issues',     icon: AlertCircle },
              { href: `/projects/${proj.id}/sprints`,    label: 'Sprints',    icon: PlayCircle },
              { href: `/projects/${proj.id}/reports`,    label: 'Reports',    icon: BarChart3 },
              { href: `/projects/${proj.id}/releases`,   label: 'Releases',   icon: Tag },
              { href: `/projects/${proj.id}/components`, label: 'Components', icon: Layers },
              { href: `/projects/${proj.id}/settings`,   label: 'Settings',   icon: Settings },
            ];

            return (
              <div key={proj.id} style={{ marginBottom: 6 }}>
                {/* Project Title Row */}
                <Link
                  href={`/projects/${proj.id}/board`}
                  title={collapsed ? proj.name : undefined}
                  style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    padding: collapsed ? '10px 0' : '10px 14px',
                    marginInline: collapsed ? 0 : 8,
                    borderRadius: '10px',
                    color: isProjectActive ? '#fff' : 'rgba(255,255,255,0.85)',
                    backgroundColor: isProjectActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    {/* Project Avatar */}
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      backgroundColor: proj.avatarColor || '#EAB308',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '0.75rem', fontWeight: 800,
                    }}>
                      {proj.name.charAt(0).toUpperCase()}
                    </div>

                    {!collapsed && (
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: isProjectActive ? 700 : 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {proj.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                          {projectKey}
                        </div>
                      </div>
                    )}
                  </div>

                  {!collapsed && (
                    <ChevronDown
                      size={14}
                      color="rgba(255,255,255,0.5)"
                      style={{
                        transform: isProjectActive ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s',
                      }}
                    />
                  )}
                </Link>

                {/* Sub-Navigation Items for Active Project */}
                {isProjectActive && !collapsed && (
                  <div style={{ paddingLeft: 22, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {subNavItems.map(subItem => {
                      const isSubActive = pathname === subItem.href || (subItem.label === 'Board' && pathname === `/projects/${proj.id}`);

                      return (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '7px 12px',
                            borderRadius: 'var(--radius-pill)',
                            color: isSubActive ? '#fff' : 'rgba(255,255,255,0.68)',
                            backgroundColor: isSubActive ? 'var(--color-green-accent)' : 'transparent',
                            fontWeight: isSubActive ? 600 : 400,
                            fontSize: '0.8125rem',
                            textDecoration: 'none',
                            transition: 'var(--transition-fast)',
                          }}
                        >
                          <subItem.icon size={16} style={{ flexShrink: 0 }} />
                          <span>{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Card */}
      <div style={{ padding: collapsed ? '12px 8px' : '16px 14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: 'var(--radius-card)',
          padding: collapsed ? '8px' : '10px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <Avatar name={user?.fullName ?? 'Robert Sofia'} src={user?.avatarUrl} size={32} />
            {!collapsed && (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.fullName ?? 'Robert Sofia'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email ?? 'robert34@gmail.com'}
                </div>
              </div>
            )}
          </div>
          {!collapsed && <ChevronRightIcon size={16} color="var(--color-text-secondary)" />}
        </div>
      </div>
    </aside>
  );
}
