'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Filter, CheckCircle2 } from 'lucide-react';
import { issueApi } from '@/lib/api/issue';
import { projectApi } from '@/lib/api/project';
import { refApi } from '@/lib/api/ref';
import { toast } from '@/components/ui/Toast';
import { IssueDetailModal } from '@/components/issue/IssueDetailModal';
import { CreateIssueModal } from '@/components/issue/CreateIssueModal';
import { IssueListTable } from './IssueListTable';
import { IssueListBulkBar } from './IssueListBulkBar';
import type { Issue, IssueStatus, IssuePriority, IssueType, CreateIssueRequest } from '@/types/issue';

interface IssueListContainerProps {
  projectId: string;
}

export function IssueListContainer({ projectId }: IssueListContainerProps) {
  const qc = useQueryClient();

  // Filter & Search State
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selection state for multi-delete
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals & Inline Create state
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [fullCreateModalOpen, setFullCreateModalOpen] = useState(false);
  const [parentForCreate, setParentForCreate] = useState<Issue | null>(null);
  const [inlineCreateParentId, setInlineCreateParentId] = useState<string | 'ROOT' | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Fetch Issues
  const { data: issuesPage, isLoading: loadingIssues, refetch: refetchIssues } = useQuery({
    queryKey: ['issues', projectId],
    queryFn: () => (projectId ? issueApi.list(projectId) : null),
    enabled: Boolean(projectId),
  });

  // 2. Fetch Project Members
  const { data: members = [] } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => (projectId ? projectApi.listMembers(projectId).then((r) => r.data) : []),
    enabled: Boolean(projectId),
  });

  // 3. Fetch Reference Data (Issue Types, Statuses, Priorities)
  const { data: issueTypesRes } = useQuery({
    queryKey: ['ref', 'issue-types'],
    queryFn: () => refApi.getIssueTypes(),
    staleTime: 1000 * 60 * 30,
  });

  const { data: statusesRes } = useQuery({
    queryKey: ['ref', 'statuses'],
    queryFn: () => refApi.getStatuses(),
    staleTime: 1000 * 60 * 30,
  });

  const { data: prioritiesRes } = useQuery({
    queryKey: ['ref', 'priorities'],
    queryFn: () => refApi.getPriorities(),
    staleTime: 1000 * 60 * 30,
  });

  const issueTypes = issueTypesRes?.data ?? [];
  const statuses = statusesRes?.data ?? [];
  const priorities = prioritiesRes?.data ?? [];

  const allIssues: Issue[] = issuesPage?.data ?? [];

  // Filtered issues based on query, type, and status
  const filteredIssues = useMemo(() => {
    return allIssues.filter((issue) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        issue.title.toLowerCase().includes(q) ||
        issue.key.toLowerCase().includes(q) ||
        issue.assignee?.fullName?.toLowerCase().includes(q);

      const matchesType = typeFilter === 'ALL' || issue.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || issue.status === statusFilter;

      return matchesQuery && matchesType && matchesStatus;
    });
  }, [allIssues, query, typeFilter, statusFilter]);

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ issueId, status }: { issueId: string; status: IssueStatus }) =>
      issueApi.updateStatus(issueId, status),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      qc.invalidateQueries({ queryKey: ['issue', variables.issueId] });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const updateAssigneeMutation = useMutation({
    mutationFn: ({ issueId, assigneeId }: { issueId: string; assigneeId: string | null }) =>
      issueApi.updateAssignee(issueId, assigneeId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      qc.invalidateQueries({ queryKey: ['issue', variables.issueId] });
      toast.success('Assignee updated');
    },
    onError: () => toast.error('Failed to update assignee'),
  });

  const updatePriorityMutation = useMutation({
    mutationFn: ({ issueId, priority }: { issueId: string; priority: IssuePriority }) =>
      issueApi.update(issueId, { priority }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      qc.invalidateQueries({ queryKey: ['issue', variables.issueId] });
      toast.success('Priority updated');
    },
    onError: () => toast.error('Failed to update priority'),
  });

  const deleteSingleMutation = useMutation({
    mutationFn: (issueId: string) => issueApi.delete(issueId),
    onSuccess: (_, deletedId) => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deletedId);
        return next;
      });
      toast.success('Issue deleted');
    },
    onError: () => toast.error('Failed to delete issue'),
  });

  const deleteBulkMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => issueApi.delete(id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      setSelectedIds(new Set());
      toast.success('Selected issues deleted');
    },
    onError: () => toast.error('Failed to delete some issues'),
  });

  const inlineCreateMutation = useMutation({
    mutationFn: (req: CreateIssueRequest) => issueApi.create(projectId, req),
    onSuccess: (res) => {
      const createdIssue = res?.data;
      if (createdIssue) {
        qc.setQueryData(['issues', projectId], (old: any) => {
          if (!old || !Array.isArray(old.data)) return old;
          if (old.data.some((i: any) => i.id === createdIssue.id)) return old;
          return {
            ...old,
            data: [createdIssue, ...old.data],
            total: (old.total ?? old.data.length) + 1,
          };
        });
      }
      qc.invalidateQueries({ queryKey: ['issues', projectId], refetchType: 'none' });
      toast.success('Issue created');
    },
    onError: () => toast.error('Failed to create issue'),
  });

  // Checkbox selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredIssues.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredIssues.map((i) => i.id)));
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchIssues();
    setTimeout(() => setIsRefreshing(false), 300);
  };

  const handleSubmitInlineCreate = async (data: {
    title: string;
    type: IssueType;
    priority: IssuePriority;
    assigneeId?: string;
  }) => {
    const matchedType = issueTypes.find(
      (t) => t.name.toUpperCase() === data.type.toUpperCase()
    );
    const matchedStatus = statuses.find(
      (s) => s.name.toUpperCase() === 'TO DO' || s.extra === 'TODO'
    );
    const matchedPriority = priorities.find(
      (p) => p.name.toUpperCase() === data.priority.toUpperCase()
    );

    await inlineCreateMutation.mutateAsync({
      title: data.title,
      type: data.type,
      priority: data.priority,
      status: 'TODO',
      issueTypeId: matchedType?.id,
      statusId: matchedStatus?.id,
      priorityId: matchedPriority?.id,
      assigneeId: data.assigneeId,
      parentId: inlineCreateParentId !== 'ROOT' ? inlineCreateParentId || undefined : undefined,
    });
    setInlineCreateParentId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* 1. Header Toolbar (Search + Filters + Full Create Trigger) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: 260 }}>
            <span
              style={{
                position: 'absolute',
                left: 10,
                top: 9,
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search work, key, assignee..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                height: 34,
                paddingLeft: '2rem',
                paddingRight: '0.75rem',
                fontSize: '0.84rem',
                border: '1px solid rgba(0,0,0,0.14)',
                borderRadius: '6px',
                outline: 'none',
                backgroundColor: 'var(--color-surface-white)',
              }}
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              height: 34,
              fontSize: '0.8125rem',
              fontWeight: 500,
              padding: '0 8px',
              border: '1px solid rgba(0,0,0,0.14)',
              borderRadius: '6px',
              backgroundColor: 'var(--color-surface-white)',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Types</option>
            <option value="TASK">Tasks</option>
            <option value="EPIC">Epics</option>
            <option value="BUG">Bugs</option>
            <option value="STORY">Stories</option>
            <option value="SUBTASK">Subtasks</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              height: 34,
              fontSize: '0.8125rem',
              fontWeight: 500,
              padding: '0 8px',
              border: '1px solid rgba(0,0,0,0.14)',
              borderRadius: '6px',
              backgroundColor: 'var(--color-surface-white)',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Action Button to open Modal creation */}
        <button
          type="button"
          onClick={() => {
            setParentForCreate(null);
            setFullCreateModalOpen(true);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'var(--color-green-brand)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 14px',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-green-accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-green-brand)')}
        >
          <Plus size={15} />
          <span>Create issue modal</span>
        </button>
      </div>

      {/* 2. Jira List Table */}
      {loadingIssues ? (
        <div
          style={{
            padding: '4rem',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid rgba(0,0,0,0.1)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Loading issues...
        </div>
      ) : (
        <IssueListTable
          issues={filteredIssues}
          allIssuesCount={allIssues.length}
          selectedIds={selectedIds}
          selectedIssueId={selectedIssueId}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onOpenDetail={(id) => setSelectedIssueId(id)}
          onDelete={(id) => deleteSingleMutation.mutate(id)}
          onUpdateStatus={(id, st) => updateStatusMutation.mutate({ issueId: id, status: st })}
          onUpdateAssignee={(id, aid) => updateAssigneeMutation.mutate({ issueId: id, assigneeId: aid })}
          onUpdatePriority={(id, pr) => updatePriorityMutation.mutate({ issueId: id, priority: pr })}
          inlineCreateOpen={inlineCreateParentId !== null}
          inlineCreateParentId={inlineCreateParentId}
          onCloseInlineCreate={() => setInlineCreateParentId(null)}
          onOpenInlineCreate={() => setInlineCreateParentId('ROOT')}
          onSubmitInlineCreate={handleSubmitInlineCreate}
          onAddChild={(parent) => {
            setInlineCreateParentId(parent.id);
          }}
          members={members}
          isSubmittingCreate={inlineCreateMutation.isPending}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      )}

      {/* 3. Floating Bulk Action Bar */}
      <IssueListBulkBar
        selectedCount={selectedIds.size}
        onDeleteSelected={() => {
          if (
            window.confirm(
              `Are you sure you want to delete ${selectedIds.size} selected issues? This cannot be undone.`
            )
          ) {
            deleteBulkMutation.mutate(Array.from(selectedIds));
          }
        }}
        onClearSelection={() => setSelectedIds(new Set())}
        isDeleting={deleteBulkMutation.isPending}
      />

      {/* 4. Full Create Issue Modal */}
      <CreateIssueModal
        open={fullCreateModalOpen}
        onClose={() => {
          setFullCreateModalOpen(false);
          setParentForCreate(null);
        }}
        projectId={projectId}
        initialParentId={parentForCreate?.id}
        initialParentKey={parentForCreate?.key}
        initialParentTitle={parentForCreate?.title}
        initialType={parentForCreate ? 'SUBTASK' : undefined}
      />

      {/* 5. Issue Detail Peek / Right Bar Modal */}
      <IssueDetailModal
        issueId={selectedIssueId}
        projectId={projectId}
        onClose={() => setSelectedIssueId(null)}
        issues={filteredIssues}
        onNavigateIssue={(id) => setSelectedIssueId(id)}
      />
    </div>
  );
}
