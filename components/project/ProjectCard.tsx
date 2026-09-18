'use client';

import Link from 'next/link';
import { ArrowRight, Users, Layers } from 'lucide-react';
import type { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
}

const AVATAR_COLORS = [
  '#006241','#00754A','#1E3932','#2563eb','#7e22ce','#0891b2','#059669','#d97706','#be123c',
];
function getColor(key: string) { let h=0; for(let i=0;i<key.length;i++) h=key.charCodeAt(i)+((h<<5)-h); return AVATAR_COLORS[Math.abs(h)%AVATAR_COLORS.length]; }

export function ProjectCard({ project }: ProjectCardProps) {
  const pKey = project.projectKey || project.key || '';
  const color = project.avatarColor ?? getColor(pKey);

  return (
    <Link href={`/projects/${project.id}/summary`} style={{ textDecoration: 'none' }}>
      <div
        className="card"
        style={{ padding: '1.25rem', cursor: 'pointer', transition: 'var(--transition-base)', height: '100%' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)'; }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
            }}>
              {pKey}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)', lineHeight: 1.3 }}>{project.name}</div>
            </div>
          </div>
          <ArrowRight size={16} style={{ color: 'var(--color-green-accent)', marginTop: 4, flexShrink: 0 }} />
        </div>
        {project.description && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.875rem', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {project.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={13} />{project.memberCount ?? 0} members</span>
          {project.role && <span className="badge badge-green" style={{ fontSize: '0.7rem', marginLeft: 'auto' }}>{project.role.replace('PROJECT_','')}</span>}
        </div>
      </div>
    </Link>
  );
}
