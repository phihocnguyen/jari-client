'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  CheckSquare,
  BookOpen,
  Bug,
  Zap,
  Layers,
  ChevronsUp,
  ChevronUp as PrioUp,
  Minus,
  ChevronDown as PrioDown,
  ChevronsDown,
  X,
} from 'lucide-react';
import { releaseApi } from '@/lib/api/release';
import { projectApi } from '@/lib/api/project';
import { issueApi } from '@/lib/api/issue';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { AddWorkItemsModal } from '@/components/release/AddWorkItemsModal';
import type { Issue, Release } from '@/types/issue';

interface PageProps {
  params: Promise<{ projectId: string; releaseId: string }>;
}

function TypeIcon({ type }: { type?: string }) {
  const t = (type || 'TASK').toUpperCase();
  if (t === 'STORY') return <BookOpen size={15} color="#22A06B" />;
  if (t === 'BUG') return <Bug size={15} color="#E34935" />;
  if (t === 'EPIC') return <Zap size={15} color="#8F7EE7" />;
  if (t === 'SUBTASK') return <Layers size={15} color="#4C9AFF" />;
  return <CheckSquare size={15} color="#4C9AFF" />;
}

function PriorityIcon({ priority }: { priority?: string }) {
  const p = (priority || 'MEDIUM').toUpperCase();
  if (p === 'HIGHEST') return <ChevronsUp size={14} color="#DE350B" />;
  if (p === 'HIGH') return <PrioUp size={14} color="#FF5630" />;
  if (p === 'MEDIUM') return <Minus size={14} color="#FFAB00" />;
  if (p === 'LOW') return <PrioDown size={14} color="#0065FF" />;
  return <ChevronsDown size={14} color="#6554C0" />;
}

function statusCategory(issue: Issue): 'DONE' | 'IN_PROGRESS' | 'TODO' {
  const cat = (issue.statusCategory || issue.status || '').toUpperCase().replace(/\s+/g, '_');
  if (cat.includes('DONE') || cat.includes('RESOLVED') || cat.includes('CLOSED')) return 'DONE';
  if (cat.includes('PROGRESS') || cat.includes('REVIEW') || cat.includes('TEST')) return 'IN_PROGRESS';
  return 'TODO';
}

const cardStyle: CSSProperties = {
  backgroundColor: 'var(--color-surface-white)',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 8,
  padding: '1rem 1.125rem',
  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
};

export default function ReleaseDetailPage({ params }: PageProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const [resolved, setResolved] = useState<{ projectId: string; releaseId: string } | null>(null);
  const [workItemsOpen, setWorkItemsOpen] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState('');

  useEffect(() => {
    params.then(setResolved);
  }, [params]);

  const projectId = resolved?.projectId ?? '';
  const releaseId = resolved?.releaseId ?? '';

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.get(projectId).then((r) => r.data),
    enabled: Boolean(projectId),
  });

  const { data: release, isLoading: loadingRelease } = useQuery({
    queryKey: ['release', releaseId],
    queryFn: () => releaseApi.get(releaseId) as Promise<Release>,
    enabled: Boolean(releaseId),
  });

  const { data: issuesPage, isLoading: loadingIssues } = useQuery({
    queryKey: ['issues', projectId, 'all'],
    queryFn: () => issueApi.list(projectId, { size: 200 }),
    enabled: Boolean(projectId),
  });

  const allIssues = issuesPage?.data ?? [];
  const releaseIssues = useMemo(
    () => allIssues.filter((i) => i.releaseId === releaseId),
    [allIssues, releaseId]
  );

  const filteredIssues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return releaseIssues;
    return releaseIssues.filter(
      (i) =>
        i.title?.toLowerCase().includes(q) ||
        i.key?.toLowerCase().includes(q) ||
        i.issueKey?.toLowerCase().includes(q)
    );
  }, [releaseIssues, searchQuery]);

  const progress = useMemo(() => {
    const done = releaseIssues.filter((i) => statusCategory(i) === 'DONE').length;
    const inProgress = releaseIssues.filter((i) => statusCategory(i) === 'IN_PROGRESS').length;
    const todo = releaseIssues.filter((i) => statusCategory(i) === 'TODO').length;
    const total = releaseIssues.length;
    return { done, inProgress, todo, total };
  }, [releaseIssues]);

  const updateMutation = useMutation({
    mutationFn: (data: { status?: string; description?: string; releaseDate?: string }) =>
      releaseApi.update(releaseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['release', releaseId] });
      qc.invalidateQueries({ queryKey: ['releases', projectId] });
      toast.success('Release updated');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update release');
    },
  });

  const removeIssueMutation = useMutation({
    mutationFn: (issueId: string) => issueApi.setRelease(issueId, null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Work item removed from release');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to remove work item');
    },
  });

  if (!projectId || !releaseId) return null;

  if (loadingRelease) {
    return (
      <div style={{ padding: '2rem', color: 'var(--color-text-secondary)' }}>Loading release…</div>
    );
  }

  if (!release) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: '#DE350B', marginBottom: 12 }}>Release not found.</p>
        <Button variant="outlined" onClick={() => router.push(`/projects/${projectId}/releases`)}>
          Back to releases
        </Button>
      </div>
    );
  }

  const driverName = project?.leadName || 'Unassigned';
  const pctDone = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
  const pctInProgress = progress.total ? Math.round((progress.inProgress / progress.total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', paddingBottom: '2rem' }}>
      {/* Breadcrumb / back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link
          href={`/projects/${projectId}/releases`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#44546F',
            textDecoration: 'none',
            padding: '4px 6px',
            borderRadius: 4,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(9,30,66,0.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <ArrowLeft size={14} />
          Releases
        </Link>
        <span style={{ color: '#B3BAC5' }}>/</span>
        <span style={{ fontSize: '0.8125rem', color: '#172B4D', fontWeight: 600 }}>{release.name}</span>
      </div>

      <h1
        style={{
          fontSize: '1.625rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.02em',
          margin: 0,
        }}
      >
        {release.name}
      </h1>

      {/* Main layout: work items + right panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: '1.25rem',
          alignItems: 'start',
        }}
        className="release-detail-grid"
      >
        <style>{`
          @media (max-width: 960px) {
            .release-detail-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* ─── Work items ─────────────────────────────────────── */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: workItemsOpen ? '1px solid rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <button
              type="button"
              onClick={() => setWorkItemsOpen((v) => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#172B4D' }}>Work items</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '1px 8px',
                  borderRadius: 10,
                  backgroundColor: '#EBECF0',
                  color: '#44546F',
                }}
              >
                {releaseIssues.length}
              </span>
              {workItemsOpen ? <ChevronUp size={16} color="#626F86" /> : <ChevronDown size={16} color="#626F86" />}
            </button>
            <button
              type="button"
              title="Add work items"
              onClick={() => setAddOpen(true)}
              style={{
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                borderRadius: 4,
                background: 'transparent',
                color: '#44546F',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F5F7')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Plus size={16} />
            </button>
          </div>

          {workItemsOpen && (
            <>
              <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
                  <Search
                    size={14}
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#8993A4',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search work items"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      height: 32,
                      paddingLeft: 30,
                      paddingRight: 10,
                      borderRadius: 4,
                      border: '1px solid #DFE1E6',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                {loadingIssues ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#626F86', fontSize: '0.875rem' }}>
                    Loading work items…
                  </div>
                ) : filteredIssues.length === 0 ? (
                  <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: '#626F86', fontSize: '0.875rem' }}>
                    {searchQuery.trim()
                      ? 'No work items match your search'
                      : 'No work items in this release yet'}
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #EBECF0', backgroundColor: '#FAFBFC' }}>
                        <th style={{ textAlign: 'left', padding: '8px 16px', fontWeight: 600, color: '#44546F', width: 36 }} />
                        <th style={{ textAlign: 'left', padding: '8px 8px', fontWeight: 600, color: '#44546F', width: 90 }}>Key</th>
                        <th style={{ textAlign: 'left', padding: '8px 8px', fontWeight: 600, color: '#44546F' }}>Summary</th>
                        <th style={{ textAlign: 'left', padding: '8px 8px', fontWeight: 600, color: '#44546F', width: 40 }} />
                        <th style={{ textAlign: 'left', padding: '8px 8px', fontWeight: 600, color: '#44546F', width: 110 }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '8px 16px', fontWeight: 600, color: '#44546F', width: 140 }}>Assignee</th>
                        <th style={{ width: 40 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIssues.map((issue) => (
                        <tr
                          key={issue.id}
                          style={{ borderBottom: '1px solid #F4F5F7' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '10px 16px' }}>
                            <TypeIcon type={issue.issueType || issue.type} />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <Link
                              href={`/projects/${projectId}/issues/${issue.id}`}
                              style={{ color: '#0C66E4', fontWeight: 600, textDecoration: 'none' }}
                            >
                              {issue.key || issue.issueKey}
                            </Link>
                          </td>
                          <td style={{ padding: '10px 8px', color: '#172B4D', fontWeight: 500 }}>
                            {issue.title}
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <PriorityIcon priority={issue.priority} />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: 3,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor:
                                  statusCategory(issue) === 'DONE'
                                    ? '#E3FCEF'
                                    : statusCategory(issue) === 'IN_PROGRESS'
                                      ? '#DEEBFF'
                                      : '#F4F5F7',
                                color:
                                  statusCategory(issue) === 'DONE'
                                    ? '#006644'
                                    : statusCategory(issue) === 'IN_PROGRESS'
                                      ? '#0747A6'
                                      : '#42526E',
                              }}
                            >
                              {(issue.status || 'TODO').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            {issue.assignee ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Avatar name={issue.assignee.fullName} size={22} />
                                <span style={{ color: '#172B4D', fontSize: '0.8125rem' }}>
                                  {issue.assignee.fullName}
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: '#A5ADBA' }}>Unassigned</span>
                            )}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <button
                              type="button"
                              title="Remove from release"
                              onClick={() => removeIssueMutation.mutate(issue.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#8993A4',
                                padding: 4,
                                borderRadius: 4,
                                display: 'flex',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFEBE6';
                                e.currentTarget.style.color = '#DE350B';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#8993A4';
                              }}
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <Button
                  variant="outlined"
                  onClick={() => setAddOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={15} /> Add work items
                </Button>
              </div>
            </>
          )}
        </div>

        {/* ─── Right panel ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Status & details */}
          <div style={cardStyle}>
            <select
              value={release.status || 'UNRELEASED'}
              onChange={(e) => updateMutation.mutate({ status: e.target.value })}
              style={{
                width: '100%',
                height: 36,
                padding: '0 10px',
                borderRadius: 4,
                border: '1px solid #DFE1E6',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#172B4D',
                backgroundColor: '#FFFFFF',
                marginBottom: 14,
                cursor: 'pointer',
              }}
            >
              <option value="UNRELEASED">Unreleased</option>
              <option value="RELEASED">Released</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#626F86', marginBottom: 4 }}>
                  Start date
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#A5ADBA' }}>Start date not set</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#626F86', marginBottom: 4 }}>
                  Release date
                </div>
                <input
                  type="date"
                  value={release.releaseDate ? String(release.releaseDate).slice(0, 10) : ''}
                  onChange={(e) =>
                    updateMutation.mutate({ releaseDate: e.target.value || undefined })
                  }
                  style={{
                    width: '100%',
                    height: 32,
                    padding: '0 8px',
                    borderRadius: 4,
                    border: '1px solid #DFE1E6',
                    fontSize: '0.8125rem',
                    color: release.releaseDate ? '#172B4D' : '#A5ADBA',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#626F86', marginBottom: 6 }}>
                Driver
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={driverName} size={24} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#172B4D' }}>{driverName}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#626F86', marginBottom: 6 }}>
                Description
              </div>
              {editingDesc ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea
                    rows={3}
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: 8,
                      borderRadius: 4,
                      border: '1px solid #DFE1E6',
                      fontSize: '0.8125rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDesc(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={updateMutation.isPending}
                      onClick={() => {
                        updateMutation.mutate(
                          { description: descDraft },
                          { onSuccess: () => setEditingDesc(false) }
                        );
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDescDraft(release.description || '');
                    setEditingDesc(true);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: '1px dashed transparent',
                    borderRadius: 4,
                    padding: '6px 4px',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    color: release.description ? '#172B4D' : '#A5ADBA',
                    lineHeight: 1.45,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F5F7')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {release.description || 'No description added yet.'}
                </button>
              )}
            </div>
          </div>

          {/* Progress */}
          <div style={cardStyle}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#172B4D', marginBottom: 12 }}>
              Progress
            </div>

            <div style={{ marginBottom: 4, fontSize: '0.8125rem', fontWeight: 600, color: '#44546F' }}>
              Work items
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#626F86', marginBottom: 8 }}>
              {progress.done} of {progress.total} done
            </div>

            <div
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#EBECF0',
                overflow: 'hidden',
                display: 'flex',
                marginBottom: 14,
              }}
            >
              {pctDone > 0 && (
                <div style={{ width: `${pctDone}%`, backgroundColor: '#22A06B' }} />
              )}
              {pctInProgress > 0 && (
                <div style={{ width: `${pctInProgress}%`, backgroundColor: '#0C66E4' }} />
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8125rem', color: '#44546F' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22A06B' }} />
                Done: {progress.done} work item{progress.done === 1 ? '' : 's'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0C66E4' }} />
                In progress: {progress.inProgress} work item{progress.inProgress === 1 ? '' : 's'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#B3BAC5' }} />
                To do: {progress.todo} work item{progress.todo === 1 ? '' : 's'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddWorkItemsModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        projectId={projectId}
        releaseId={releaseId}
        existingIssueIds={new Set(releaseIssues.map((i) => i.id))}
      />
    </div>
  );
}
