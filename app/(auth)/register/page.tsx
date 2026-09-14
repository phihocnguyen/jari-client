'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/components/ui/Toast';

// ─── Schema ───────────────────────────────────────────────────────
const schema = z.object({
  fullName:        z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Invalid email address'),
  password:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

// ─── Register Page ────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const login  = useAuthStore(s => s.login);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.register({
        fullName: data.fullName,
        email:    data.email,
        password: data.password,
      });
      login(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success('Account created!', 'Welcome to Jari 🎉');
      router.push('/');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed. Please try again.';
      toast.error('Registration failed', message);
    } finally {
      setLoading(false);
    }
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
          Create your free account
        </p>
      </div>

      {/* Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
          Get started
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            id="register-name"
            label="Full name"
            type="text"
            placeholder="Jane Smith"
            autoComplete="name"
            leftIcon={<User size={16} />}
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            id="register-email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={<Mail size={16} />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            id="register-password"
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            leftIcon={<Lock size={16} />}
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            id="register-confirm-password"
            label="Confirm password"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            leftIcon={<Lock size={16} />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            id="register-submit"
            type="submit"
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: '0.5rem' }}
          >
            Create account
          </Button>
        </form>

        {/* Login link */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-green-accent)', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
