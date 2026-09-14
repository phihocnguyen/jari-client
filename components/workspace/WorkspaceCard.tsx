'use client';

import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import type { Workspace } from '@/types/workspace';

// ─── WorkspaceCard ────────────────────────────────────────────────
interface WorkspaceCardProps {
  workspace: Workspace;
}

const COLORS = [
  '#006241', '#00754A', '#1E3932', '#2b5148',
  '#2563eb', '#7e22ce', '#0891b2', '#059669', '#d97706',
];

function getColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const color = getColor(workspace.name);

  return (
    <Link href={`/workspaces/${workspace.id}/projects`} style={{ textDecoration: 'none' }}>
      <div
        className="card"
        style={{ padding: '1.25rem', cursor: 'pointer', transition: 'var(--transition-base)', height: '100%' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'none';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)';
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '1.125rem',
              flexShrink: 0,
            }}>
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
                {workspace.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                /{workspace.workspaceKey || workspace.slug}
              </div>
            </div>
          </div>
          <ArrowRight size={16} style={{ color: 'var(--color-green-accent)', marginTop: 4, flexShrink: 0 }} />
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            <Users size={13} />
            <span>{workspace.memberCount ?? 0} members</span>
          </div>
          {workspace.role && (
            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
              {workspace.role.replace('WORKSPACE_', '')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
