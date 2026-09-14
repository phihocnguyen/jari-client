'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/components/ui/Toast';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

// ─── Login Page ───────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const login  = useAuthStore(s => s.login);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      login(res.data.user, res.data.accessToken, res.data.refreshToken);
      router.push('/');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed. Please check your credentials.';
      toast.error('Login failed', message);
    } finally {
      setLoading(false);
    }
  };

  const [googleOAuthUrl, setGoogleOAuthUrl] = useState('#');

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
    const origin = window.location.origin;
    setGoogleOAuthUrl(`${API_URL.replace('/api/v1', '')}/oauth2/authorize/google?redirect_uri=${encodeURIComponent(`${origin}/auth/callback`)}`);
  }, []);

  const handleBypassLogin = () => {
    login({
      id: '11111111-1111-1111-1111-111111111111',
      fullName: 'Admin User',
      email: 'admin@jari.com',
      avatarUrl: undefined,
      createdAt: new Date().toISOString(),
    }, 'demo-access-token', 'demo-refresh-token');
    toast.success('Bypassed login', 'Welcome to Jari Demo Mode!');
    router.push('/');
  };

  return (
    <div style={{ width: '100%', maxWidth: 440 }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          marginBottom: '0.5rem',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'var(--color-house-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '1.25rem',
          }}>J</div>
          <span style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--color-house-green)', letterSpacing: '-0.02em' }}>
            Jari
          </span>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Project management made simple
        </p>
      </div>

      {/* Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
          Welcome back
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            id="login-email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={<Mail size={16} />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            id="login-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            leftIcon={<Lock size={16} />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            id="login-submit"
            type="submit"
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: '0.5rem' }}
          >
            Sign in
          </Button>
        </form>

        <Button
          variant="outlined"
          fullWidth
          onClick={handleBypassLogin}
          style={{ marginTop: '0.75rem', borderColor: 'var(--color-green-accent)', color: 'var(--color-green-brand)' }}
        >
          ⚡ Bypass Login (Enter Demo Mode)
        </Button>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          margin: '1.25rem 0',
        }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }} />
        </div>

        {/* Google OAuth */}
        <a
          id="login-google"
          href={googleOAuthUrl}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
            width: '100%', padding: '10px 16px',
            border: '1px solid rgba(0,0,0,0.18)', borderRadius: 'var(--radius-pill)',
            background: '#fff', cursor: 'pointer', textDecoration: 'none',
            fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-primary)',
            transition: 'var(--transition-base)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-canvas-cool)')}
          onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
        >
          {/* Google SVG */}
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continue with Google
        </a>

        {/* Register link */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--color-green-accent)', fontWeight: 500 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
