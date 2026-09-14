'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Briefcase, Settings, ChevronLeft, ChevronRight,
  FolderKanban, BarChart3, Tag, Layers, AlertCircle, Code2, PlusCircle,
  Plus, Grid, Rocket, ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth.store';

// ─── Sidebar Component ─────────────────────────────────────────────
interface SidebarProps {
  collapsed:   boolean;
  onToggle:    () => void;
  projectId?:  string;
  workspaceId?: string;
}

export function Sidebar({ collapsed, onToggle, projectId }: SidebarProps) {
  const pathname = usePathname();
  const user     = useAuthStore(s => s.user);

  // Dynamic project nav items matching Teams in Space sidebar
  const navItems = [
    { href: projectId ? `/projects/${projectId}/backlog` : '/backlog',    label: 'Backlog',    icon: FolderKanban },
    { href: projectId ? `/projects/${projectId}/board` : '/',            label: 'Board',      icon: LayoutDashboard },
    { href: '/reports',                                                   label: 'Reports',    icon: BarChart3 },
    { href: '/releases',                                                  label: 'Releases',   icon: Tag },
    { href: '/components',                                                label: 'Components', icon: Layers },
    { href: '/issues',                                                    label: 'Issues',     icon: AlertCircle },
    { href: '/repository',                                                label: 'Repository', icon: Code2 },
    { href: '/add-item',                                                  label: 'Add item',   icon: PlusCircle },
    { href: projectId ? `/projects/${projectId}/settings` : '/settings', label: 'Settings',   icon: Settings },
  ];

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          </div>

          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                style={{
                  background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 6,
                  width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', cursor: 'pointer',
                }}
                title="Create new"
              >
                <Plus size={16} />
              </button>
              <button
                style={{
                  background: 'transparent', border: 'none', borderRadius: 6,
                  width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                }}
                title="App switcher"
              >
                <Grid size={16} />
              </button>
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

        {/* Project Header Card */}
        <div style={{ padding: collapsed ? '12px 8px' : '16px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              backgroundColor: '#EAB308',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              <Rocket size={18} />
            </div>
            {!collapsed && (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Teams in Space
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
                  Software project
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ padding: '12px 0', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.label === 'Board' && (pathname === '/' || pathname.endsWith('/board')));

            return (
              <Link
                key={item.label}
                href={item.href}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '10px 0' : '10px 16px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  marginInline: collapsed ? 0 : 8,
                  marginBottom: 4,
                  borderRadius: 'var(--radius-pill)',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.72)',
                  backgroundColor: isActive ? 'var(--color-green-accent)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'var(--transition-fast)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = isActive ? '#fff' : 'rgba(255,255,255,0.72)';
                }}
              >
                <item.icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
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
