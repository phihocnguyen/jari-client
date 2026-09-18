'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Briefcase, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import type { Workspace } from '@/types/workspace';
import type { Project } from '@/types/project';

interface DashboardWorkspacesProps {
  workspaces: Workspace[];
  allProjects: Project[];
  isLoading: boolean;
  onCreateWorkspace: () => void;
}

export function DashboardWorkspaces({
  workspaces,
  allProjects,
  isLoading,
  onCreateWorkspace,
}: DashboardWorkspacesProps) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Your Workspaces
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Organizational containers that group your teams and projects.
          </p>
        </div>
        <Button
          variant="outlined"
          onClick={onCreateWorkspace}
          leftIcon={<Plus size={14} />}
          style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
        >
          New Workspace
        </Button>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <Briefcase size={36} style={{ color: 'var(--color-text-secondary)', margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No workspaces found</h3>
          <Button onClick={onCreateWorkspace}>Create a workspace</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {workspaces.map((ws) => {
            const wsProjects = allProjects.filter((p: any) => p.workspaceId === ws.id);
            return (
              <Link key={ws.id} href={`/workspaces/${ws.id}/projects`} style={{ textDecoration: 'none' }}>
                <div
                  className="card"
                  style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'var(--transition-base)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.875rem' }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: 'var(--color-green-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-green-brand)',
                        fontWeight: 700,
                        fontSize: '1rem',
                        flexShrink: 0,
                      }}
                    >
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          color: 'var(--color-text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {ws.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', gap: 8, marginTop: 2 }}>
                        <span>
                          {wsProjects.length} {wsProjects.length === 1 ? 'project' : 'projects'}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Users size={11} /> {ws.memberCount ?? 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.625rem',
                      borderTop: '1px solid rgba(0,0,0,0.05)',
                      fontSize: '0.75rem',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <span style={{ textTransform: 'capitalize' }}>
                      {ws.role?.replace('WORKSPACE_', '').toLowerCase() || 'Member'}
                    </span>
                    <span style={{ color: 'var(--color-green-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      View Projects <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
