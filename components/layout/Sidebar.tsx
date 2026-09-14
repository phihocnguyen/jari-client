'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Briefcase, Settings, ChevronLeft, ChevronRight,
  FolderKanban, Users,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth.store';

// ─── Nav Items ────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/',            label: 'My Work',    icon: LayoutDashboard },
  { href: '/workspaces',  label: 'Workspaces', icon: Briefcase },
];

// ─── Sidebar ─────────────────────────────────────────────────────
interface SidebarProps {
  collapsed:   boolean;
  onToggle:    () => void;
  projectId?:  string;
  workspaceId?: string;
}

export function Sidebar({ collapsed, onToggle, projectId, workspaceId }: SidebarProps) {
  const pathname = usePathname();
  const user     = useAuthStore(s => s.user);

  // Dynamic project nav items
  const projectNavItems = projectId ? [
    { href: `/projects/${projectId}/board`,   label: 'Board',   icon: LayoutDashboard },
    { href: `/projects/${projectId}/backlog`, label: 'Backlog', icon: FolderKanban },
    { href: `/projects/${projectId}/settings`,label: 'Settings',icon: Settings },
  ] : [];

  const w = collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';

  return (
    <aside
      className="app-sidebar"
      style={{ width: w }}
    >
      {/* Logo / Brand */}
      <div style={{
        height: 'var(--topbar-height)',
        display: 'flex', alignItems: 'center',
        padding: collapsed ? '0 12px' : '0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        gap: 10, overflow: 'hidden',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: 'var(--color-green-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '1rem',
        }}>J</div>
        {!collapsed && (
          <span style={{
            fontWeight: 700, fontSize: '1.125rem', color: '#fff',
            letterSpacing: '-0.02em', whiteSpace: 'nowrap',
            opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s',
          }}>
            Jari
          </span>
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
        {collapsed
          ? <ChevronRight size={12} />
          : <ChevronLeft  size={12} />
        }
      </button>

      {/* Navigation */}
      <nav style={{ padding: '12px 0', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Main nav */}
        <SidebarSection label="MAIN" collapsed={collapsed}>
          {NAV_ITEMS.map(item => (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={<item.icon size={18} />}
              active={pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </SidebarSection>

        {/* Project nav */}
        {projectNavItems.length > 0 && (
          <SidebarSection label="PROJECT" collapsed={collapsed} style={{ marginTop: 16 }}>
            {projectNavItems.map(item => (
              <SidebarLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={<item.icon size={18} />}
                active={pathname.startsWith(item.href)}
                collapsed={collapsed}
              />
            ))}
          </SidebarSection>
        )}
      </nav>

      {/* User at bottom */}
      {user && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: collapsed ? '12px 8px' : '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          overflow: 'hidden',
        }}>
          <Avatar name={user.fullName} src={user.avatarUrl} size={32} />
          {!collapsed && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div style={{
                fontSize: '0.8125rem', fontWeight: 600, color: '#fff',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user.fullName}
              </div>
              <div style={{
                fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user.email}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

// ─── SidebarSection ───────────────────────────────────────────────
function SidebarSection({
  label, collapsed, children, style,
}: {
  label: string; collapsed: boolean; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      {!collapsed && (
        <div style={{
          padding: '0 14px 4px',
          fontSize: '0.6875rem', fontWeight: 600,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── SidebarLink ─────────────────────────────────────────────────
function SidebarLink({
  href, label, icon, active, collapsed,
}: {
  href: string; label: string; icon: React.ReactNode;
  active: boolean; collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex', alignItems: 'center',
        gap: 10,
        padding: collapsed ? '8px 0' : '8px 14px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        marginInline: collapsed ? 0 : 6,
        borderRadius: collapsed ? 0 : 'var(--radius-md)',
        color: active ? '#fff' : 'rgba(255,255,255,0.62)',
        background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
        fontWeight: active ? 600 : 400,
        fontSize: '0.875rem',
        textDecoration: 'none',
        transition: 'var(--transition-fast)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.color = '#fff';
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = active ? '#fff' : 'rgba(255,255,255,0.62)';
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
