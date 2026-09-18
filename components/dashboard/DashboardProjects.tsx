'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, FolderKanban, LayoutDashboard, Kanban, Layers, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import type { Project } from '@/types/project';

interface DashboardProjectsProps {
  projects: (Project & { workspaceName?: string; workspaceId?: string })[];
  isLoading: boolean;
  hasWorkspaces: boolean;
  onCreateProject: () => void;
}

export function DashboardProjects({
  projects,
  isLoading,
  hasWorkspaces,
  onCreateProject,
}: DashboardProjectsProps) {
  const router = useRouter();

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Projects & Spaces
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Select a project to view its summary dashboard or jump straight into the board.
          </p>
        </div>
        {hasWorkspaces && (
          <Button
            variant="outlined"
            onClick={onCreateProject}
            leftIcon={<Plus size={14} />}
            style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
          >
            Create Project
          </Button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <FolderKanban size={36} style={{ color: 'var(--color-text-secondary)', margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No projects created yet</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Create your first project in a workspace to start managing issues and Kanban boards.
          </p>
          <Button onClick={onCreateProject}>Create your first project</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="card"
              onClick={() => router.push(`/projects/${proj.id}/summary`)}
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'var(--transition-base)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div>
                {/* Project Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        backgroundColor: proj.avatarColor || '#00754A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.9375rem',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                      }}
                    >
                      {(proj.projectKey || proj.name).charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: 'var(--color-text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {proj.name}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {proj.workspaceName || 'Workspace'}
                  </span>
                </div>

                {/* Description */}
                {proj.description && (
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.45,
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {proj.description}
                  </p>
                )}
              </div>

              {/* Action Links row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.875rem',
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                  marginTop: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', gap: 6 }}>
                  <Link
                    href={`/projects/${proj.id}/summary`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--color-green-light)',
                      color: 'var(--color-green-brand)',
                      padding: '4px 10px',
                      borderRadius: 6,
                      textDecoration: 'none',
                    }}
                  >
                    <LayoutDashboard size={13} />
                    <span>Summary</span>
                  </Link>
                  <Link
                    href={`/projects/${proj.id}/board`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--color-text-secondary)',
                      padding: '4px 8px',
                      borderRadius: 6,
                      textDecoration: 'none',
                    }}
                  >
                    <Kanban size={13} />
                    <span>Board</span>
                  </Link>
                  <Link
                    href={`/projects/${proj.id}/backlog`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--color-text-secondary)',
                      padding: '4px 8px',
                      borderRadius: 6,
                      textDecoration: 'none',
                    }}
                  >
                    <Layers size={13} />
                    <span>Backlog</span>
                  </Link>
                </div>

                <Link
                  href={`/projects/${proj.id}/summary`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                  }}
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
