'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { workspaceApi } from '@/lib/api/workspace';
import { Briefcase, FolderKanban, Clock, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal';

// ─── Dashboard Page ───────────────────────────────────────────────
export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces', user?.id],
    queryFn: () => workspaceApi.list(user?.id).then(r => r.data),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 5,
  });

  const [greeting, setGreeting] = useState('Welcome back');

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Hero greeting */}
        <div style={{
          background: 'var(--color-house-green)',
          borderRadius: 'var(--radius-card)',
          padding: '2rem 2.5rem',
          marginBottom: '1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', right: -40, top: -40,
            width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }} />
          <div style={{
            position: 'absolute', right: 60, bottom: -60,
            width: 160, height: 160, borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
          }} />

          <div>
            <h1 style={{
              color: '#fff', fontSize: '1.625rem', fontWeight: 700,
              marginBottom: '0.375rem',
            }}>
              {greeting}, {(user?.fullName || (user as any)?.displayName || 'User').split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9375rem' }}>
              Here&apos;s what&apos;s on your plate today.
            </p>
          </div>
          <Button
            variant="outlined"
            onClick={() => setCreateWorkspaceOpen(true)}
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
            leftIcon={<Plus size={15} />}
          >
            Create Workspace
          </Button>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem', marginBottom: '1.75rem',
        }}>
          <StatCard
            icon={<Briefcase size={20} />}
            label="Workspaces"
            value={workspaces?.length ?? 0}
            color="var(--color-green-accent)"
          />
          <StatCard
            icon={<FolderKanban size={20} />}
            label="Projects"
            value="—"
            color="var(--color-green-brand)"
          />
          <StatCard
            icon={<Clock size={20} />}
            label="Open Issues"
            value="—"
            color="var(--color-gold)"
          />
        </div>

        {/* Workspaces section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Your Workspaces
            </h2>
          </div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : workspaces?.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <Briefcase size={32} style={{ color: 'var(--color-text-secondary)', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No workspaces yet</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Create a workspace to start managing your projects.
              </p>
              <Button onClick={() => setCreateWorkspaceOpen(true)}>Create workspace</Button>
            </div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {workspaces?.slice(0, 6).map(ws => (
              <Link key={ws.id} href={`/workspaces/${ws.id}/projects`} style={{ textDecoration: 'none' }}>
                <div
                  className="card"
                  style={{ padding: '1.25rem', cursor: 'pointer', transition: 'var(--transition-base)' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-card)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.75rem' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'var(--color-green-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-green-brand)', fontWeight: 700, fontSize: '1rem',
                    }}>
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                        {ws.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {ws.memberCount ?? 0} members
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      {ws.role?.replace('WORKSPACE_', '').toLowerCase()}
                    </span>
                    <ArrowRight size={14} style={{ color: 'var(--color-green-accent)' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
    <CreateWorkspaceModal
      open={createWorkspaceOpen}
      onClose={() => setCreateWorkspaceOpen(false)}
    />
    </>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: string;
}) {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, marginBottom: '0.75rem',
      }}>
        {icon}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
