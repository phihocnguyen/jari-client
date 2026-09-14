'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ListFilter, Search } from 'lucide-react';
import { issueApi } from '@/lib/api/issue';
import { projectApi } from '@/lib/api/project';
import { IssueRow } from '@/components/issue/IssueRow';
import { CreateIssueModal } from '@/components/issue/CreateIssueModal';
import { IssueDetailModal } from '@/components/issue/IssueDetailModal';
import { Button } from '@/components/ui/Button';
import type { Issue, IssueFilter } from '@/types/issue';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function IssuesPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ projectId: string } | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  const projectId = resolvedParams?.projectId ?? '';

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? projectApi.get(projectId).then(r => r.data) : null),
    enabled: Boolean(projectId),
  });

  const { data: issuesPage, isLoading } = useQuery({
    queryKey: ['issues', projectId],
    queryFn: () => (projectId ? issueApi.list(projectId) : null),
    enabled: Boolean(projectId),
  });

  const allIssues: Issue[] = issuesPage?.data ?? [];

  if (!projectId) return null;

  const filteredIssues = allIssues.filter(issue => {
    const matchesQuery = !query.trim() || issue.title.toLowerCase().includes(query.toLowerCase()) || issue.key.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || issue.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Issues ({filteredIssues.length})
        </h1>

        <Button onClick={() => setCreateIssueOpen(true)}>
          <Plus size={16} /> Create issue
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 280 }}>
          <span style={{ position: 'absolute', left: 12, top: 10, color: 'var(--color-text-secondary)' }}>
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search issues..."
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', height: 38, fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Status:</span>
          {['ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="btn btn-sm"
              style={{
                borderRadius: 'var(--radius-pill)',
                backgroundColor: statusFilter === st ? 'var(--color-green-brand)' : 'transparent',
                color: statusFilter === st ? '#fff' : 'var(--color-text-primary)',
                border: statusFilter === st ? '1px solid var(--color-green-brand)' : '1px solid rgba(0,0,0,0.12)',
              }}
            >
              {st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Table List */}
      <div className="card" style={{ padding: '8px 12px', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading issues list...
          </div>
        ) : filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => (
            <IssueRow
              key={issue.id}
              issue={issue}
              onClick={() => setSelectedIssueId(issue.id)}
            />
          ))
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No issues match the current filter.
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateIssueModal
        open={createIssueOpen}
        onClose={() => setCreateIssueOpen(false)}
        projectId={projectId}
      />

      <IssueDetailModal
        issueId={selectedIssueId}
        projectId={projectId}
        onClose={() => setSelectedIssueId(null)}
      />
    </div>
  );
}
