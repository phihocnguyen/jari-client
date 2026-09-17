'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, FolderKanban, Settings } from 'lucide-react';
import { issueApi } from '@/lib/api/issue';
import { Modal } from '@/components/ui/Modal';
import type { Workspace } from '@/types/workspace';
import type { Issue } from '@/types/issue';

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  activeProjectId: string;
}

export function GlobalSearchModal({
  open,
  onClose,
  workspaces,
  activeProjectId,
}: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  // Query issues in active project
  const { data: issuesRes } = useQuery({
    queryKey: ['search-issues', activeProjectId, query],
    queryFn: () => issueApi.list(activeProjectId, { query: query, size: 8 }),
    enabled: open && query.trim().length >= 1,
  });

  const issues = issuesRes?.data || [];

  const matchingProjects = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const allProj: Array<{ id: string; name: string; key: string; workspaceName: string }> = [];
    workspaces.forEach(ws => {
      ((ws as any).projects || []).forEach((p: any) => {
        if (
          p.name?.toLowerCase().includes(q) ||
          p.projectKey?.toLowerCase().includes(q) ||
          p.key?.toLowerCase().includes(q)
        ) {
          allProj.push({ id: p.id, name: p.name, key: p.projectKey || p.key, workspaceName: ws.name });
        }
      });
    });
    return allProj;
  }, [workspaces, query]);

  const matchingWorkspaces = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return workspaces.filter(
      w => w.name.toLowerCase().includes(q) || w.workspaceKey?.toLowerCase().includes(q)
    );
  }, [workspaces, query]);

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <Modal open={open} onClose={onClose} title="Search Jari">
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
            placeholder="Search projects, issues, or workspaces…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.9375rem',
              color: '#172B4D',
            }}
          />
          {query && (
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

        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {/* Matching Issues */}
          {issues.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#626F86',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 6,
                }}
              >
                Issues ({issues.length})
              </div>
              {issues.map((issue: Issue) => (
                <div
                  key={issue.id}
                  onClick={() => handleNavigate(`/projects/${activeProjectId}/board?issue=${issue.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F4F5F7')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: '#0C66E4' }}>{issue.key}</span>
                    <span style={{ color: '#172B4D' }}>{issue.title}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: '#EBECF0',
                      color: '#44546F',
                    }}
                  >
                    {issue.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Matching Projects */}
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
                }}
              >
                Projects ({matchingProjects.length})
              </div>
              {matchingProjects.map(p => (
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
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F4F5F7')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FolderKanban size={16} color="#00754A" />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: '#172B4D' }}>{p.name}</span>
                    <span style={{ color: '#626F86', marginLeft: 6 }}>({p.key})</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#626F86' }}>{p.workspaceName}</span>
                </div>
              ))}
            </div>
          )}

          {/* Matching Workspaces */}
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
                }}
              >
                Workspaces ({matchingWorkspaces.length})
              </div>
              {matchingWorkspaces.map(w => (
                <div
                  key={w.id}
                  onClick={() => handleNavigate(`/workspaces/${w.id}/settings`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F4F5F7')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Settings size={16} color="#626F86" />
                  <span style={{ fontWeight: 600, color: '#172B4D' }}>{w.name}</span>
                  <span style={{ color: '#626F86' }}>({w.workspaceKey})</span>
                </div>
              ))}
            </div>
          )}

          {query.trim() &&
            !matchingProjects.length &&
            !matchingWorkspaces.length &&
            !issues.length && (
              <div style={{ padding: '24px', textAlign: 'center', color: '#626F86', fontSize: '0.875rem' }}>
                No results found for &ldquo;{query}&rdquo;
              </div>
            )}
        </div>
      </div>
    </Modal>
  );
}
