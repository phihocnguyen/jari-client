'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Filter, CheckCircle2, X, Layers } from 'lucide-react';
import { issueApi } from '@/lib/api/issue';
import { projectApi } from '@/lib/api/project';
import { componentApi } from '@/lib/api/component';
import { refApi } from '@/lib/api/ref';
import { toast } from '@/components/ui/Toast';
import { IssueDetailModal } from '@/components/issue/IssueDetailModal';
import { CreateIssueModal } from '@/components/issue/CreateIssueModal';
import { IssueListTable } from './IssueListTable';
import { IssueListBulkBar } from './IssueListBulkBar';
import { Select } from '@/components/ui/Select';
import { renderTypeIcon } from '@/utils/issue-type';
import { getStatusBadgeStyle } from '@/utils/issue-status';
import type { Issue, IssueStatus, IssuePriority, IssueType, CreateIssueRequest } from '@/types/issue';

interface IssueListContainerProps {
  projectId: string;
  initialComponent?: string;
}

export function IssueListContainer({ projectId, initialComponent }: IssueListContainerProps) {
  const qc = useQueryClient();

  // Filter & Search State
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [componentFilter, setComponentFilter] = useState<string>(() => {
    if (initialComponent) return initialComponent;
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('component') || 'ALL';
    }
    return 'ALL';
  });

  // Pagination State (Max 10 items per page)
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);

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
    staleTime: 1000 * 60 * 5,
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

  // 4. Fetch Project Components
  const { data: projectComponents = [] } = useQuery({
    queryKey: ['project-components', projectId],
    queryFn: () => (projectId ? componentApi.list(projectId) : []),
    enabled: Boolean(projectId),
  });

  const issueTypes = issueTypesRes?.data ?? [];
  const statuses = statusesRes?.data ?? [];
  const priorities = prioritiesRes?.data ?? [];

  const allIssues: Issue[] = issuesPage?.data ?? [];

  // Expand / collapse state for parent issues in hierarchical list
  const [expandedParentIds, setExpandedParentIds] = useState<Set<string>>(new Set());

  // Auto-expand any parents that have children on data load / change
  useEffect(() => {
    if (!allIssues.length) return;
    setExpandedParentIds((prev) => {
      const next = new Set(prev);
      allIssues.forEach((issue) => {
        if (issue.parentId) {
          next.add(issue.parentId);
        }
      });
      return next;
    });
  }, [allIssues]);

  const handleToggleExpand = (parentId: string) => {
    setExpandedParentIds((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  };

  // Filtered issues based on query, type, status, and component, preserving parent-child relationships
  const filteredIssues = useMemo(() => {
    if (!allIssues.length) return [];
    const q = query.trim().toLowerCase();
    const hasFilter = Boolean(q || typeFilter !== 'ALL' || statusFilter !== 'ALL' || componentFilter !== 'ALL');
    if (!hasFilter) return allIssues;

    // Directly matching issue IDs
    const directlyMatchingIds = new Set<string>();
    allIssues.forEach((issue) => {
      const matchesQuery =
        !q ||
        issue.title.toLowerCase().includes(q) ||
        issue.key.toLowerCase().includes(q) ||
        issue.assignee?.fullName?.toLowerCase().includes(q);

      const matchesType = typeFilter === 'ALL' || issue.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || issue.status === statusFilter;
      const matchesComponent =
        componentFilter === 'ALL' ||
        (issue.components && issue.components.some((c) => c.id === componentFilter || c.name === componentFilter));

      if (matchesQuery && matchesType && matchesStatus && matchesComponent) {
        directlyMatchingIds.add(issue.id);
      }
    });

    // Also include the parents of any matching subtask
    const includedIds = new Set<string>(directlyMatchingIds);
    allIssues.forEach((issue) => {
      if (directlyMatchingIds.has(issue.id) && issue.parentId) {
        includedIds.add(issue.parentId);
      }
    });

    return allIssues.filter((i) => includedIds.has(i.id));
  }, [allIssues, query, typeFilter, statusFilter, componentFilter]);

  // Group root issues and calculate pagination (max 10 items per page)
  const { rootIssues, childrenMap } = useMemo(() => {
    const issueIdSet = new Set(filteredIssues.map((i) => i.id));
    const roots: Issue[] = [];
    const children = new Map<string, Issue[]>();

    filteredIssues.forEach((issue) => {
      if (issue.parentId && issueIdSet.has(issue.parentId)) {
        const list = children.get(issue.parentId) || [];
        list.push(issue);
        children.set(issue.parentId, list);
      } else {
        roots.push(issue);
      }
    });

    return { rootIssues: roots, childrenMap: children };
  }, [filteredIssues]);

  // Flatten hierarchical issues keeping subtasks grouped under parents
  const allOrderedIssues = useMemo(() => {
    const result: Issue[] = [];
    rootIssues.forEach((root) => {
      result.push(root);
      const subtasks = childrenMap.get(root.id) || [];
      subtasks.forEach((sub) => result.push(sub));
    });
    return result;
  }, [rootIssues, childrenMap]);

  const totalCount = allOrderedIssues.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Strictly at most 10 items per page
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allOrderedIssues.slice(start, start + pageSize);
  }, [allOrderedIssues, currentPage, pageSize]);

  // Auto-clamp page if items shrink
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ issueId, status }: { issueId: string; status: IssueStatus }) =>
      issueApi.updateStatus(issueId, status),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      qc.invalidateQueries({ queryKey: ['issue', variables.issueId] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const updateAssigneeMutation = useMutation({
    mutationFn: ({ issueId, assigneeId }: { issueId: string; assigneeId: string | null }) =>
      issueApi.updateAssignee(issueId, assigneeId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      qc.invalidateQueries({ queryKey: ['issue', variables.issueId] });
    },
    onError: () => toast.error('Failed to update assignee'),
  });

  const updatePriorityMutation = useMutation({
    mutationFn: ({ issueId, priority }: { issueId: string; priority: IssuePriority }) =>
      issueApi.update(issueId, { priority }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      qc.invalidateQueries({ queryKey: ['issue', variables.issueId] });
    },
    onError: () => toast.error('Failed to update priority'),
  });

  const updateDueDateMutation = useMutation({
    mutationFn: ({ issueId, dueDate }: { issueId: string; dueDate: string | null }) =>
      issueApi.update(issueId, { dueDate: dueDate || undefined }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      qc.invalidateQueries({ queryKey: ['issue', variables.issueId] });
    },
    onError: () => toast.error('Failed to update due date'),
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
    dueDate?: string;
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
      dueDate: data.dueDate || undefined,
      issueTypeId: matchedType?.id,
      statusId: matchedStatus?.id,
      priorityId: matchedPriority?.id,
      assigneeId: data.assigneeId,
      parentId: inlineCreateParentId !== 'ROOT' ? inlineCreateParentId || undefined : undefined,
    });
    setInlineCreateParentId(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
        animation: 'listFadeIn 0.25s ease-out forwards',
      }}
    >
      <style>{`
        @keyframes listFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
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
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
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

          {/* Type Filter (using shared Select component) */}
          <Select<string>
            value={typeFilter}
            onChange={(val) => {
              setTypeFilter(val);
              setCurrentPage(1);
            }}
            minWidth={150}
            options={[
              { value: 'ALL', label: 'All Types' },
              { value: 'TASK', label: 'Tasks', icon: renderTypeIcon('TASK') },
              { value: 'STORY', label: 'Stories', icon: renderTypeIcon('STORY') },
              { value: 'BUG', label: 'Bugs', icon: renderTypeIcon('BUG') },
              { value: 'EPIC', label: 'Epics', icon: renderTypeIcon('EPIC') },
              { value: 'SUBTASK', label: 'Subtasks', icon: renderTypeIcon('SUBTASK') },
            ]}
          />

          {/* Status Filter (using shared Select component) */}
          <Select<string>
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            minWidth={150}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'TODO', label: 'To Do', badgeStyle: getStatusBadgeStyle('TODO') },
              { value: 'IN_PROGRESS', label: 'In Progress', badgeStyle: getStatusBadgeStyle('IN_PROGRESS') },
              { value: 'IN_REVIEW', label: 'In Review', badgeStyle: getStatusBadgeStyle('IN_REVIEW') },
              { value: 'DONE', label: 'Done', badgeStyle: getStatusBadgeStyle('DONE') },
            ]}
          />

          {/* Component Filter */}
          <Select<string>
            value={componentFilter}
            onChange={(val) => {
              setComponentFilter(val);
              setCurrentPage(1);
            }}
            minWidth={160}
            options={[
              { value: 'ALL', label: 'All Components' },
              ...projectComponents.map((c) => ({
                value: c.id,
                label: c.name,
              })),
            ]}
          />

          {/* Active Component Filter Chip with Clear Button */}
          {componentFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => {
                setComponentFilter('ALL');
                setCurrentPage(1);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                borderRadius: 12,
                backgroundColor: '#e9f2ff',
                color: '#0c66e4',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Clear component filter"
            >
              <span>
                Component: {projectComponents.find((c) => c.id === componentFilter)?.name || componentFilter}
              </span>
              <X size={12} />
            </button>
          )}
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
        <IssueListTableSkeleton />
      ) : (
        <IssueListTable
          issues={paginatedIssues}
          allIssuesCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          selectedIds={selectedIds}
          selectedIssueId={selectedIssueId}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onOpenDetail={(id) => setSelectedIssueId(id)}
          onDelete={(id) => deleteSingleMutation.mutate(id)}
          onUpdateStatus={(id, st) => updateStatusMutation.mutate({ issueId: id, status: st })}
          onUpdateAssignee={(id, aid) => updateAssigneeMutation.mutate({ issueId: id, assigneeId: aid })}
          onUpdatePriority={(id, pr) => updatePriorityMutation.mutate({ issueId: id, priority: pr })}
          onUpdateDueDate={(id, date) => updateDueDateMutation.mutate({ issueId: id, dueDate: date })}
          inlineCreateOpen={inlineCreateParentId !== null}
          inlineCreateParentId={inlineCreateParentId}
          onCloseInlineCreate={() => setInlineCreateParentId(null)}
          onOpenInlineCreate={() => setInlineCreateParentId('ROOT')}
          onSubmitInlineCreate={handleSubmitInlineCreate}
          onAddChild={(parent) => {
            setInlineCreateParentId(parent.id);
            setExpandedParentIds((prev) => new Set(prev).add(parent.id));
          }}
          members={members}
          isSubmittingCreate={inlineCreateMutation.isPending}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          expandedParentIds={expandedParentIds}
          onToggleExpand={handleToggleExpand}
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

function IssueListTableSkeleton() {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
      }}
    >
      {/* Table Header Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '40px 100px 1fr 120px 100px 140px 100px',
          padding: '10px 16px',
          backgroundColor: '#F8F9FA',
          borderBottom: '1px solid #E2E8F0',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <div className="skeleton" style={{ width: 16, height: 16, borderRadius: 3 }} />
        <div className="skeleton" style={{ width: 60, height: 14, borderRadius: 3 }} />
        <div className="skeleton" style={{ width: 120, height: 14, borderRadius: 3 }} />
        <div className="skeleton" style={{ width: 70, height: 14, borderRadius: 3 }} />
        <div className="skeleton" style={{ width: 60, height: 14, borderRadius: 3 }} />
        <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 3 }} />
        <div className="skeleton" style={{ width: 60, height: 14, borderRadius: 3 }} />
      </div>

      {/* Rows Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 100px 1fr 120px 100px 140px 100px',
              padding: '12px 16px',
              borderBottom: '1px solid #F1F5F9',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <div className="skeleton" style={{ width: 16, height: 16, borderRadius: 3 }} />
            <div className="skeleton" style={{ width: 55, height: 16, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: `${i % 2 === 0 ? 65 : 80}%`, height: 16, borderRadius: 4, maxWidth: 380 }} />
            <div className="skeleton" style={{ width: 75, height: 22, borderRadius: 12 }} />
            <div className="skeleton" style={{ width: 65, height: 18, borderRadius: 4 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="skeleton" style={{ width: 22, height: 22, borderRadius: '50%' }} />
              <div className="skeleton" style={{ width: 70, height: 14, borderRadius: 3 }} />
            </div>
            <div className="skeleton" style={{ width: 65, height: 14, borderRadius: 3 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
