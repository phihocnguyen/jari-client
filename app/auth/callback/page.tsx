'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth';
import { tokenStorage } from '@/lib/auth/token';
import { toast } from '@/components/ui/Toast';

// ─── OAuth2 Callback Page ─────────────────────────────────────────
// After Google OAuth, backend redirects to this page with ?token=<access>&refresh=<refresh>
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore(s => s.login);

  useEffect(() => {
    const accessToken  = searchParams.get('token') || searchParams.get('accessToken');
    const refreshToken = searchParams.get('refresh') || searchParams.get('refreshToken');

    if (!accessToken || !refreshToken) {
      toast.error('Authentication failed', 'No tokens received from OAuth provider.');
      router.push('/login');
      return;
    }

    // Store tokens then fetch user info
    tokenStorage.set(accessToken, refreshToken);

    authApi.getMe()
      .then(res => {
        login(res.data, accessToken, refreshToken);
        router.push('/');
      })
      .catch(() => {
        tokenStorage.clear();
        toast.error('Authentication failed', 'Could not retrieve user info.');
        router.push('/login');
      });
  }, [searchParams, login, router]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-canvas-warm)',
    }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: 40, height: 40, border: '3px solid var(--color-green-light)',
          borderTop: '3px solid var(--color-green-accent)',
          borderRadius: '50%',
        }} className="animate-spin" />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Signing you in…
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid var(--color-green-light)', borderTop: '3px solid var(--color-green-accent)', borderRadius: '50%' }} />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
