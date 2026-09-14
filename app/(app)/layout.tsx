'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { wsClient } from '@/lib/websocket/client';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { ToastContainer } from '@/components/ui/Toast';

// ─── App Shell Layout (Client Guard) ─────────────────────────────
export default function AppShellLayout({ children }: LayoutProps<'/'>) {
  const router          = useRouter();
  const user            = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const addNotification = useNotificationStore(s => s.addNotification);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated,  setHydrated]  = useState(false);

  // Wait for Zustand persistence hydration
  useEffect(() => { setHydrated(true); }, []);

  // Auth guard
  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  // WebSocket connection for notifications
  useEffect(() => {
    if (!user) return;
    wsClient.connect(user.id, (notification) => {
      addNotification(notification);
    });
    return () => { wsClient.disconnect(); };
  }, [user, addNotification]);

  // Loading state while hydrating
  if (!hydrated || !isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="app-shell">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
        <div className={`app-content${collapsed ? ' sidebar-collapsed' : ''}`}>
          <TopBar />
          <main className="app-main">
            {children}
          </main>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
