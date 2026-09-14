'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft, ChevronRight, Briefcase, ChevronRight as ChevronRightIcon,
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

  // Extract active project ID from URL
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
          }}>
            PROJECTS ({projects.length})
          </div>
        )}

        {/* Dynamic List of Existing Projects */}
        <nav style={{ padding: '8px 0', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {projects.map((proj: Project) => {
            const isProjectActive = activeProjectId === proj.id;
            const projectKey = proj.projectKey || proj.key || 'PROJ';

            return (
              <div key={proj.id} style={{ marginBottom: 4 }}>
                <Link
                  href={`/projects/${proj.id}/summary`}
                  title={collapsed ? proj.name : undefined}
                  style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '10px 0' : '10px 14px',
                    marginInline: collapsed ? 0 : 8,
                    borderRadius: 'var(--radius-pill)',
                    color: isProjectActive ? '#fff' : 'rgba(255,255,255,0.85)',
                    backgroundColor: isProjectActive ? 'var(--color-green-accent)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={e => {
                    if (!isProjectActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={e => {
                    if (!isProjectActive) e.currentTarget.style.backgroundColor = 'transparent';
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
                        <div style={{ fontSize: '0.875rem', fontWeight: isProjectActive ? 700 : 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {proj.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                          {projectKey}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
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
