'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HelpCircle, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/Avatar';
import type { Workspace } from '@/types/workspace';

interface SidebarFooterProps {
  collapsed: boolean;
  workspaces: Workspace[];
  onOpenShortcuts: () => void;
}

export function SidebarFooter({ collapsed, workspaces, onOpenShortcuts }: SidebarFooterProps) {
  const router = useRouter();
  const currentUser = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  return (
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
            onClick={onOpenShortcuts}
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
            onClick={onOpenShortcuts}
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
            type="button"
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
  );
}
