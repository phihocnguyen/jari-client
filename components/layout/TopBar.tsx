'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { authApi } from '@/lib/api/auth';
import { tokenStorage } from '@/lib/auth/token';
import { toast } from '@/components/ui/Toast';

// ─── TopBar ───────────────────────────────────────────────────────
interface TopBarProps {
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function TopBar({ breadcrumbs }: TopBarProps) {
  const router          = useRouter();
  const user            = useAuthStore(s => s.user);
  const logout          = useAuthStore(s => s.logout);
  const unreadCount     = useNotificationStore(s => s.unreadCount);
  const [userOpen, setUserOpen]   = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userRef  = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setUserOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      const refresh = tokenStorage.getRefresh();
      if (refresh) await authApi.logout(refresh);
    } catch { /* ignore */ }
    logout();
    router.push('/login');
  };

  return (
    <header className="app-topbar">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
        {breadcrumbs?.map((crumb, idx) => (
          <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {idx > 0 && (
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>/</span>
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                style={{
                  color: idx === breadcrumbs.length - 1
                    ? 'var(--color-text-primary)'
                    : 'var(--color-green-accent)',
                  fontSize: '0.875rem',
                  fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400,
                  textDecoration: 'none',
                }}
              >
                {crumb.label}
              </Link>
            ) : (
              <span style={{
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}>
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* Right: Notification + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Notification Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            id="topbar-notifications"
            onClick={() => setNotifOpen(v => !v)}
            aria-label="Notifications"
            style={{
              position: 'relative',
              background: 'none', border: 'none',
              cursor: 'pointer', borderRadius: '50%',
              width: 38, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-secondary)',
              transition: 'var(--transition-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 8, height: 8,
                background: 'var(--color-red)',
                borderRadius: '50%',
                border: '2px solid #fff',
              }} />
            )}
          </button>

          {notifOpen && (
            <NotificationDropdown onClose={() => setNotifOpen(false)} />
          )}
        </div>

        {/* User Menu */}
        {user && (
          <div ref={userRef} style={{ position: 'relative' }}>
            <button
              id="topbar-user-menu"
              onClick={() => setUserOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 8px', borderRadius: 'var(--radius-md)',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <Avatar name={user?.fullName || (user as any)?.displayName || 'User'} src={user?.avatarUrl} size={30} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {(user?.fullName || (user as any)?.displayName || 'User').split(' ')[0]}
              </span>
              <ChevronDown size={14} style={{ color: 'var(--color-text-secondary)' }} />
            </button>

            {userOpen && (
              <div
                className="animate-scale-in"
                style={{
                  position: 'absolute', top: '100%', right: 0,
                  marginTop: 6,
                  background: 'var(--color-surface-cool)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--shadow-dropdown)',
                  minWidth: 200,
                  overflow: 'hidden',
                  zIndex: 50,
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                {/* User info header */}
                <div style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(0,0,0,0.08)',
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                    {user?.fullName || (user as any)?.displayName || 'User'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 1 }}>
                    {user.email}
                  </div>
                </div>

                {/* Menu Items */}
                <UserMenuItem icon={<User size={15} />} label="Profile" href="/profile" />
                <UserMenuItem icon={<Settings size={15} />} label="Settings" href="/settings" />
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', marginTop: 4 }} />
                <button
                  id="topbar-logout"
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '9px 14px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.875rem', color: 'var(--color-red)',
                    textAlign: 'left',
                    transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,32,20,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

// ─── UserMenuItem ─────────────────────────────────────────────────
function UserMenuItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 14px',
        fontSize: '0.875rem', color: 'var(--color-text-primary)',
        textDecoration: 'none',
        transition: 'var(--transition-fast)',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      <span style={{ color: 'var(--color-text-secondary)' }}>{icon}</span>
      {label}
    </Link>
  );
}

// ─── NotificationDropdown ─────────────────────────────────────────
function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const { notifications, markRead, markAllRead } = useNotificationStore();

  return (
    <div
      className="animate-scale-in"
      style={{
        position: 'absolute', top: '100%', right: 0,
        marginTop: 6,
        background: '#fff',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-dropdown)',
        width: 340,
        maxHeight: 420,
        overflow: 'hidden',
        zIndex: 50,
        border: '1px solid rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notifications</span>
        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllRead}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--color-green-accent)' }}
          >
            Mark all read
          </button>
        )}
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 20).map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
                background: n.read ? 'transparent' : 'rgba(0,117,74,0.04)',
                cursor: 'pointer',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}
            >
              {!n.read && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-green-accent)', marginTop: 4, flexShrink: 0 }} />
              )}
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                {n.message}
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
