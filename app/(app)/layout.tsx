'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { ToastContainer } from '@/components/ui/Toast';

// ─── App Shell Layout (Client Guard) ─────────────────────────────
export default function AppShellLayout({ children }: LayoutProps<'/'>) {
  const router          = useRouter();
  const user            = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
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

  // Loading state while hydrating
  if (!hydrated || !isAuthenticated) {
    return null;
  }

  return (
    <WebSocketProvider>
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
    </WebSocketProvider>
  );
}
