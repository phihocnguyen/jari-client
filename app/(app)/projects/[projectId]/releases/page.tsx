'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Tag,
  Calendar,
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { projectApi } from '@/lib/api/project';
import { releaseApi } from '@/lib/api/release';
import { issueApi } from '@/lib/api/issue';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { CreateReleaseModal } from '@/components/release/CreateReleaseModal';
import { EditReleaseModal } from '@/components/release/EditReleaseModal';
import type { Release, Issue } from '@/types/issue';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ReleasesPage({ params }: PageProps) {
  const qc = useQueryClient();
  const [resolvedParams, setResolvedParams] = useState<{ projectId: string } | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const projectId = resolvedParams?.projectId ?? '';

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? projectApi.get(projectId).then((r) => r.data) : null),
    enabled: Boolean(projectId),
  });

  const { data: releases = [], isLoading: loadingReleases } = useQuery({
    queryKey: ['releases', projectId],
    queryFn: () => (projectId ? releaseApi.list(projectId) : []),
    enabled: Boolean(projectId),
  });

  const { data: issuesPage } = useQuery({
    queryKey: ['issues', projectId, 'all'],
    queryFn: () => (projectId ? issueApi.list(projectId, { size: 100 }) : null),
    enabled: Boolean(projectId),
  });

  const allIssues: Issue[] = issuesPage?.data ?? [];

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (releaseId: string) => releaseApi.delete(releaseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['releases', projectId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Version deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete version');
    },
  });

  const markReleasedMutation = useMutation({
    mutationFn: (release: Release) =>
      releaseApi.update(release.id, {
        status: release.status === 'RELEASED' ? 'UNRELEASED' : 'RELEASED',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['releases', projectId] });
      toast.success('Version status updated!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update version status');
    },
  });

  if (!projectId) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.625rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Releases
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Manage and track software versions and deployments for {project?.name || 'this project'}.
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus size={16} /> Create version
        </Button>
      </div>

      {/* Releases List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loadingReleases ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading versions...
          </div>
        ) : releases.length === 0 ? (
          <div
            style={{
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--color-surface-white)',
              borderRadius: '8px',
              border: '1.5px dashed rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 98, 65, 0.08)',
                color: 'var(--color-green-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              No releases yet
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: 420 }}>
              Releases help organize and track your deliverables. Create your first version to start assigning issues.
            </p>
            <Button onClick={() => setCreateModalOpen(true)} style={{ marginTop: '6px' }}>
              <Plus size={15} /> Create version
            </Button>
          </div>
        ) : (
          releases.map((rel: Release) => {
            const releaseIssues = allIssues.filter((i) => i.releaseId === rel.id);
            const total = releaseIssues.length;
            const completed = releaseIssues.filter((i) => {
              const cat = (i.statusCategory || i.status || '').toUpperCase();
              return cat.includes('DONE') || cat.includes('RESOLVED') || cat.includes('CLOSED');
            }).length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isReleased = rel.status === 'RELEASED';
            const isArchived = rel.status === 'ARCHIVED';

            return (
              <div
                key={rel.id}
                className="card"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-surface-white)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  position: 'relative',
                }}
              >
                {/* Release Card Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        backgroundColor: isReleased ? '#E3FCEF' : 'rgba(0, 98, 65, 0.08)',
                        color: isReleased ? '#006644' : 'var(--color-green-brand)',
                        marginTop: 2,
                      }}
                    >
                      <Tag size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Link
                          href={`/projects/${projectId}/releases/${rel.id}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <h2
                            style={{
                              fontSize: '1.15rem',
                              fontWeight: 700,
                              color: 'var(--color-text-primary)',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#0C66E4')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                          >
                            {rel.name}
                          </h2>
                        </Link>
                        <span
                          className={`badge ${
                            isReleased ? 'badge-green' : isArchived ? 'badge-gray' : 'badge-gold'
                          }`}
                          style={{ fontSize: '0.72rem', fontWeight: 700 }}
                        >
                          {rel.status || 'UNRELEASED'}
                        </span>
                      </div>
                      {rel.description && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                          {rel.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions right */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {rel.releaseDate && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: '0.8125rem',
                          color: 'var(--color-text-secondary)',
                          marginRight: 6,
                        }}
                      >
                        <Calendar size={14} />
                        <span>
                          Target:{' '}
                          {new Date(rel.releaseDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}

                    <Button
                      variant={isReleased ? 'ghost' : 'outlined'}
                      size="sm"
                      onClick={() => markReleasedMutation.mutate(rel)}
                      loading={markReleasedMutation.isPending}
                    >
                      <CheckCircle2 size={14} />
                      {isReleased ? 'Unrelease' : 'Release'}
                    </Button>

                    {/* Context Menu (...) */}
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === rel.id ? null : rel.id);
                        }}
                        style={{
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 4,
                          border: '1px solid rgba(0,0,0,0.1)',
                          backgroundColor: activeMenuId === rel.id ? '#EBECF0' : '#FFFFFF',
                          color: '#42526E',
                          cursor: 'pointer',
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {activeMenuId === rel.id && (
                        <div
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 36,
                            backgroundColor: '#FFFFFF',
                            borderRadius: 6,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
                            border: '1px solid rgba(0,0,0,0.08)',
                            padding: '4px 0',
                            zIndex: 100,
                            minWidth: 140,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div
                            style={{
                              padding: '8px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              fontSize: '0.84rem',
                              cursor: 'pointer',
                              color: '#172B4D',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F5F7')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            onClick={() => {
                              setActiveMenuId(null);
                              setEditingRelease(rel);
                            }}
                          >
                            <Edit2 size={14} />
                            <span>Edit version</span>
                          </div>

                          <div
                            style={{
                              padding: '8px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              fontSize: '0.84rem',
                              cursor: 'pointer',
                              color: '#DE350B',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFEBE6')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            onClick={() => {
                              setActiveMenuId(null);
                              if (confirm(`Are you sure you want to delete version "${rel.name}"?`)) {
                                deleteMutation.mutate(rel.id);
                              }
                            }}
                          >
                            <Trash2 size={14} />
                            <span>Delete version</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Issue Counts */}
                <div style={{ marginTop: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8125rem',
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      Progress
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {completed} of {total} {total === 1 ? 'issue' : 'issues'} completed ({progress}%)
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.06)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: isReleased ? '#22C55E' : 'var(--color-green-accent)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <CreateReleaseModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        projectId={projectId}
      />

      <EditReleaseModal
        open={Boolean(editingRelease)}
        onClose={() => setEditingRelease(null)}
        projectId={projectId}
        release={editingRelease}
      />
    </div>
  );
}
