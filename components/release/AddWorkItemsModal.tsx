'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, CheckSquare, BookOpen, Bug, Zap, Layers, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { issueApi } from '@/lib/api/issue';
import { toast } from '@/components/ui/Toast';
import type { Issue } from '@/types/issue';

interface AddWorkItemsModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  releaseId: string;
  existingIssueIds: Set<string>;
}

function TypeIcon({ type }: { type?: string }) {
  const t = (type || 'TASK').toUpperCase();
  if (t === 'STORY') return <BookOpen size={15} color="#22A06B" />;
  if (t === 'BUG') return <Bug size={15} color="#E34935" />;
  if (t === 'EPIC') return <Zap size={15} color="#8F7EE7" />;
  if (t === 'SUBTASK') return <Layers size={15} color="#4C9AFF" />;
  return <CheckSquare size={15} color="#4C9AFF" />;
}

export function AddWorkItemsModal({
  open,
  onClose,
  projectId,
  releaseId,
  existingIssueIds,
}: AddWorkItemsModalProps) {
  const qc = useQueryClient();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: issuesPage, isLoading } = useQuery({
    queryKey: ['issues', projectId, 'add-to-release'],
    queryFn: () => issueApi.list(projectId, { size: 200 }),
    enabled: open && Boolean(projectId),
  });

  const candidates = useMemo(() => {
    const all = issuesPage?.data ?? [];
    const available = all.filter((i) => !existingIssueIds.has(i.id) && i.releaseId !== releaseId);
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter(
      (i) =>
        i.title?.toLowerCase().includes(q) ||
        i.key?.toLowerCase().includes(q) ||
        i.issueKey?.toLowerCase().includes(q)
    );
  }, [issuesPage?.data, existingIssueIds, releaseId, query]);

  const addMutation = useMutation({
    mutationFn: async (issueIds: string[]) => {
      await Promise.all(issueIds.map((id) => issueApi.setRelease(id, releaseId)));
    },
    onSuccess: (_data, issueIds) => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      qc.invalidateQueries({ queryKey: ['release', releaseId] });
      toast.success(
        issueIds.length === 1
          ? 'Work item added to release'
          : `${issueIds.length} work items added to release`
      );
      setSelected(new Set());
      setQuery('');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to add work items');
    },
  });

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClose = () => {
    setSelected(new Set());
    setQuery('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add work items"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={addMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={selected.size === 0 || addMutation.isPending}
            loading={addMutation.isPending}
            onClick={() => addMutation.mutate(Array.from(selected))}
          >
            Add{selected.size > 0 ? ` (${selected.size})` : ''}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={15}
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
            placeholder="Search by key or title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              height: 36,
              paddingLeft: 32,
              paddingRight: query ? 32 : 12,
              borderRadius: 4,
              border: '1px solid #DFE1E6',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8993A4',
                padding: 2,
                display: 'flex',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div
          style={{
            border: '1px solid #EBECF0',
            borderRadius: 6,
            maxHeight: 340,
            overflowY: 'auto',
            backgroundColor: '#FFFFFF',
          }}
        >
          {isLoading ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#626F86', fontSize: '0.875rem' }}>
              Loading issues…
            </div>
          ) : candidates.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#626F86', fontSize: '0.875rem' }}>
              {query.trim() ? 'No matching work items' : 'No available work items to add'}
            </div>
          ) : (
            candidates.map((issue: Issue) => {
              const isChecked = selected.has(issue.id);
              return (
                <label
                  key={issue.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderBottom: '1px solid #F4F5F7',
                    cursor: 'pointer',
                    backgroundColor: isChecked ? '#E9F2FF' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isChecked) e.currentTarget.style.backgroundColor = '#F4F5F7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isChecked ? '#E9F2FF' : 'transparent';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(issue.id)}
                    style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#0C66E4' }}
                  />
                  <TypeIcon type={issue.issueType || issue.type} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#172B4D',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <span style={{ color: '#626F86', marginRight: 6 }}>
                        {issue.key || issue.issueKey}
                      </span>
                      {issue.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#8993A4', marginTop: 1 }}>
                      {issue.status?.replace(/_/g, ' ')}
                      {issue.assignee?.fullName ? ` · ${issue.assignee.fullName}` : ''}
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
