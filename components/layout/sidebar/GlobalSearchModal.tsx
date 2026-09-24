'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Search, FolderKanban, CheckSquare, BookOpen, Bug, Zap, Layers } from 'lucide-react';
import { projectApi } from '@/lib/api/project';
import { searchApi } from '@/lib/api/search';
import { Modal } from '@/components/ui/Modal';
import type { Workspace } from '@/types/workspace';
import type { Issue } from '@/types/issue';

const DEBOUNCE_MS = 300;

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  activeProjectId: string;
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function IssueTypeIcon({ type }: { type?: string }) {
  const t = (type || 'TASK').toUpperCase();
  if (t === 'STORY') return <BookOpen size={16} color="#22A06B" />;
  if (t === 'BUG') return <Bug size={16} color="#E34935" />;
  if (t === 'EPIC') return <Zap size={16} color="#8F7EE7" />;
  if (t === 'SUBTASK') return <Layers size={16} color="#4C9AFF" />;
  return <CheckSquare size={16} color="#4C9AFF" />;
}

function formatUpdated(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return 'Recently updated';
  return `Updated ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export function GlobalSearchModal({
  open,
  onClose,
  workspaces,
  activeProjectId,
}: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmed = debouncedQuery.trim();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  // Load projects for every workspace (for Projects section + project name fallback)
  const projectQueries = useQueries({
    queries: workspaces.map((ws) => ({
      queryKey: ['projects', ws.id],
      queryFn: () => projectApi.list(ws.id).then((r) => r.data ?? []),
      enabled: open && workspaces.length > 0,
      staleTime: 1000 * 60 * 5,
    })),
  });

  const allProjects = useMemo(() => {
    const list: Array<{ id: string; name: string; key: string; workspaceName: string }> = [];
    projectQueries.forEach((q, i) => {
      const ws = workspaces[i];
      (q.data || []).forEach((p: any) => {
        list.push({
          id: p.id,
          name: p.name,
          key: p.projectKey || p.key,
          workspaceName: ws?.name || '',
        });
      });
    });
    return list;
  }, [projectQueries, workspaces]);

  // Global issue search (all accessible workspaces/projects) — debounced
  const { data: issuesRes, isFetching: searchingIssues } = useQuery({
    queryKey: ['global-search-issues', trimmed],
    queryFn: () => searchApi.issues(trimmed, 20),
    enabled: open && trimmed.length >= 1,
  });

  const issues = issuesRes?.data || [];
  const issueTotal = issuesRes?.total ?? issues.length;

  const matchingProjects = useMemo(() => {
    if (!trimmed) return [];
    const q = trimmed.toLowerCase();
    return allProjects
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.key?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [allProjects, trimmed]);

  const matchingWorkspaces = useMemo(() => {
    if (!trimmed) return [];
    const q = trimmed.toLowerCase();
    return workspaces
      .filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.workspaceKey?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [workspaces, trimmed]);

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  const isTyping = query.trim() !== trimmed;
  const showEmpty =
    trimmed.length >= 1 &&
    !isTyping &&
    !searchingIssues &&
    !issues.length &&
    !matchingProjects.length &&
    !matchingWorkspaces.length;

  return (
    <Modal open={open} onClose={onClose} title="Search">
      <div style={{ padding: '0 0 8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            border: '1px solid #DFE1E6',
            borderRadius: 6,
            backgroundColor: '#FAFBFC',
            marginBottom: 16,
          }}
        >
          <Search size={18} color="#626F86" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search work items, projects, or workspaces…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.9375rem',
              color: '#172B4D',
            }}
          />
          {(isTyping || searchingIssues) && trimmed.length >= 1 && (
            <span style={{ fontSize: '0.75rem', color: '#8993A4' }}>Searching…</span>
          )}
          {query && !isTyping && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.75rem',
                color: '#626F86',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {/* Work items — Jira-style */}
          {issues.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#626F86',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 6,
                  padding: '0 4px',
                }}
              >
                Work items
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    padding: '1px 7px',
                    borderRadius: 10,
                    backgroundColor: '#EBECF0',
                    color: '#44546F',
                    textTransform: 'none',
                    letterSpacing: 0,
                  }}
                >
                  {issueTotal}
                </span>
              </div>
              {issues.map((issue: Issue) => {
                const projectName =
                  issue.projectName ||
                  allProjects.find((p) => p.id === issue.projectId)?.name ||
                  '';
                return (
                  <div
                    key={issue.id}
                    onClick={() =>
                      handleNavigate(
                        `/projects/${issue.projectId || activeProjectId}/board?issue=${issue.id}`
                      )
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F5F7')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ marginTop: 2, flexShrink: 0 }}>
                      <IssueTypeIcon type={issue.issueType || issue.type} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#172B4D',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <span style={{ color: '#626F86', fontWeight: 600, marginRight: 6 }}>
                          {issue.key || issue.issueKey}
                        </span>
                        {issue.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#626F86',
                          marginTop: 2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {projectName}
                        {projectName && formatUpdated(issue.updatedAt) ? ' · ' : ''}
                        {formatUpdated(issue.updatedAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Projects */}
          {matchingProjects.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#626F86',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 6,
                  padding: '0 4px',
                }}
              >
                Projects ({matchingProjects.length})
              </div>
              {matchingProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleNavigate(`/projects/${p.id}/summary`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F5F7')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FolderKanban size={16} color="#00754A" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 600, color: '#172B4D' }}>{p.name}</span>
                    <span style={{ color: '#626F86', marginLeft: 6 }}>({p.key})</span>
                    {p.workspaceName && (
                      <div style={{ fontSize: '0.75rem', color: '#8993A4', marginTop: 1 }}>
                        {p.workspaceName}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Workspaces */}
          {matchingWorkspaces.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#626F86',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 6,
                  padding: '0 4px',
                }}
              >
                Workspaces ({matchingWorkspaces.length})
              </div>
              {matchingWorkspaces.map((w) => (
                <div
                  key={w.id}
                  onClick={() => handleNavigate(`/workspaces/${w.id}/projects`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F5F7')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FolderKanban size={16} color="#626F86" />
                  <span style={{ fontWeight: 600, color: '#172B4D' }}>{w.name}</span>
                  <span style={{ color: '#626F86' }}>({w.workspaceKey})</span>
                </div>
              ))}
            </div>
          )}

          {showEmpty && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#626F86', fontSize: '0.875rem' }}>
              No results found for &ldquo;{trimmed}&rdquo;
            </div>
          )}

          {!query.trim() && (
            <div style={{ padding: '16px 8px', color: '#8993A4', fontSize: '0.8125rem' }}>
              Type to search work items across all your workspaces
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
