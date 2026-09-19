'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, Link2 } from 'lucide-react';
import { issueApi } from '@/lib/api/issue';
import { projectApi } from '@/lib/api/project';
import { refApi } from '@/lib/api/ref';
import { labelApi } from '@/lib/api/label';
import { releaseApi } from '@/lib/api/release';
import { componentApi } from '@/lib/api/component';
import { toast } from '@/components/ui/Toast';
import type { Issue, IssuePriority, IssueStatus } from '@/types/issue';

import { TaskDetailHeader } from './TaskDetailHeader';
import { TaskTitleAndActions } from './TaskTitleAndActions';
import { TaskDescription } from './TaskDescription';
import { TaskSubtasks } from './TaskSubtasks';
import { TaskActivity } from './TaskActivity';
import { TaskDetailsSidebar } from './TaskDetailsSidebar';
import { TaskAiModal } from './TaskAiModal';

export interface TaskDetailViewProps {
  issueId: string;
  projectId: string;
  viewMode: 'modal' | 'right-bar' | 'full-page';
  onToggleViewMode?: () => void;
  onClose?: () => void;
  issues?: Issue[];
  onNavigateIssue?: (issueId: string) => void;
}

export function TaskDetailView({
  issueId,
  projectId,
  viewMode,
  onToggleViewMode,
  onClose,
  issues = [],
  onNavigateIssue,
}: TaskDetailViewProps) {
  const qc = useQueryClient();

  // Local UI state
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // 1. Fetch Issue Details (accepts UUID or issue key like MOBILE-13)
  const { data: issue, isLoading } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => issueApi.get(issueId).then((r) => r.data),
    enabled: Boolean(issueId),
  });

  const effectiveId = issue?.id || issueId;

  // 1.1 Fetch Project Details for breadcrumb
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? projectApi.get(projectId).then((r) => r.data) : null),
    enabled: Boolean(projectId),
  });

  // 2. Fetch Project Members
  const { data: members = [] } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectApi.listMembers(projectId).then((r) => r.data),
    enabled: Boolean(projectId),
  });

  // 3. Fetch Issue History
  const { data: history = [] } = useQuery({
    queryKey: ['issue-history', effectiveId],
    queryFn: () => issueApi.getHistory(effectiveId),
    enabled: Boolean(effectiveId),
  });

  // 3.1 Fetch Comments (dedicated endpoint, section 9.1 of API docs)
  const commentsQuery = useQuery({
    queryKey: ['issue-comments', effectiveId],
    queryFn: () => issueApi.listComments(effectiveId),
    enabled: Boolean(effectiveId),
  });

  // 4. Fetch Reference Data for Subtask Creation
  const { data: issueTypesRes } = useQuery({
    queryKey: ['ref', 'issue-types'],
    queryFn: () => refApi.getIssueTypes(),
    staleTime: 1000 * 60 * 30,
  });

  // 4.1 Fetch Project Labels
  const { data: projectLabels = [] } = useQuery({
    queryKey: ['project-labels', projectId],
    queryFn: () => labelApi.list(projectId),
    enabled: Boolean(projectId),
  });

  // 4.2 Fetch Project Releases (fix versions)
  const { data: projectReleases = [] } = useQuery({
    queryKey: ['project-releases', projectId],
    queryFn: () => releaseApi.list(projectId),
    enabled: Boolean(projectId),
  });

  // 4.3 Fetch Project Components
  const { data: projectComponents = [] } = useQuery({
    queryKey: ['project-components', projectId],
    queryFn: () => componentApi.list(projectId),
    enabled: Boolean(projectId),
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

  // Helper to sync query caches immediately across issue detail and list
  const syncIssueCache = (updater: (old: any) => any) => {
    qc.setQueryData(['issue', issueId], updater);
    if (effectiveId !== issueId) {
      qc.setQueryData(['issue', effectiveId], updater);
    }
    qc.setQueryData(['issues', projectId], (old: any) => {
      if (!old) return old;
      const list = Array.isArray(old) ? old : old.data;
      if (!Array.isArray(list)) return old;
      const newList = list.map((i: Issue) => (i.id === effectiveId ? updater(i) : i));
      return Array.isArray(old) ? newList : { ...old, data: newList };
    });
  };

  // Update Mutation (generic fields: priority, assignee, storyPoints)
  const updateMutation = useMutation({
    mutationFn: (data: Record<string, any>) => issueApi.update(effectiveId, data),
    onMutate: async (newData) => {
      await qc.cancelQueries({ queryKey: ['issue', issueId] });
      if (effectiveId !== issueId) await qc.cancelQueries({ queryKey: ['issue', effectiveId] });
      const previousIssue = qc.getQueryData(['issue', issueId]);

      // Optimistic update for instant UI feedback
      syncIssueCache((old) => {
        if (!old) return old;
        const patch: any = { ...newData };
        if ('assigneeId' in newData) {
          if (newData.assigneeId) {
            const member = members.find((m) => m.userId === newData.assigneeId);
            patch.assignee = member
              ? { id: member.userId, fullName: member.fullName, email: member.email, avatarUrl: member.avatarUrl }
              : old.assignee;
            patch.assigneeId = newData.assigneeId;
            patch.assigneeName = member?.fullName || old.assigneeName;
          } else {
            patch.assignee = null;
            patch.assigneeId = null;
            patch.assigneeName = null;
          }
        }
        return { ...old, ...patch };
      });

      return { previousIssue };
    },
    onSuccess: (res) => {
      const updated = res?.data;
      if (updated) {
        syncIssueCache((old) => (old ? { ...old, ...updated } : old));
      }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousIssue) {
        syncIssueCache(() => context.previousIssue);
      }
      toast.error('Failed to update issue');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      if (effectiveId !== issueId) qc.invalidateQueries({ queryKey: ['issue', effectiveId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
    },
  });

  // Update Dates Mutation (null clears a date)
  const updateDatesMutation = useMutation({
    mutationFn: (dates: { startDate?: string | null; dueDate?: string | null }) =>
      issueApi.updateDates(effectiveId, dates),
    onMutate: async (dates) => {
      await qc.cancelQueries({ queryKey: ['issue', issueId] });
      if (effectiveId !== issueId) await qc.cancelQueries({ queryKey: ['issue', effectiveId] });
      const previousIssue = qc.getQueryData(['issue', issueId]);

      syncIssueCache((old) => {
        if (!old) return old;
        return {
          ...old,
          ...(dates.startDate !== undefined ? { startDate: dates.startDate } : {}),
          ...(dates.dueDate !== undefined ? { dueDate: dates.dueDate } : {}),
        };
      });

      return { previousIssue };
    },
    onSuccess: (res) => {
      const updated = res?.data;
      if (updated) {
        syncIssueCache((old) => (old ? { ...old, ...updated } : old));
      }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousIssue) {
        syncIssueCache(() => context.previousIssue);
      }
      toast.error('Failed to update dates');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      if (effectiveId !== issueId) qc.invalidateQueries({ queryKey: ['issue', effectiveId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
    },
  });

  // Update Parent Mutation
  const updateParentMutation = useMutation({
    mutationFn: (parentId: string | null) => issueApi.updateParent(effectiveId, parentId),
    onMutate: async (parentId) => {
      await qc.cancelQueries({ queryKey: ['issue', issueId] });
      if (effectiveId !== issueId) await qc.cancelQueries({ queryKey: ['issue', effectiveId] });
      const previousIssue = qc.getQueryData(['issue', issueId]);

      syncIssueCache((old) => (old ? { ...old, parentId: parentId ?? null } : old));
      return { previousIssue };
    },
    onSuccess: (res) => {
      const updated = res?.data;
      if (updated) {
        syncIssueCache((old) => (old ? { ...old, ...updated } : old));
      }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousIssue) {
        syncIssueCache(() => context.previousIssue);
      }
      toast.error('Failed to update parent');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      if (effectiveId !== issueId) qc.invalidateQueries({ queryKey: ['issue', effectiveId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
    },
  });

  // Labels Mutations
  const createLabelMutation = useMutation({
    mutationFn: (name: string) => labelApi.create(projectId, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-labels', projectId] });
    },
    onError: () => toast.error('Failed to create label'),
  });

  const setLabelsMutation = useMutation({
    mutationFn: (labelIds: string[]) => issueApi.setLabels(effectiveId, labelIds),
    onMutate: async (labelIds) => {
      await qc.cancelQueries({ queryKey: ['issue', issueId] });
      if (effectiveId !== issueId) await qc.cancelQueries({ queryKey: ['issue', effectiveId] });
      const previousIssue = qc.getQueryData(['issue', issueId]);

      const selectedLabels = projectLabels.filter((l) => labelIds.includes(l.id));
      syncIssueCache((old) => (old ? { ...old, labels: selectedLabels } : old));
      return { previousIssue };
    },
    onSuccess: (res) => {
      const updated = res?.data;
      if (updated) {
        syncIssueCache((old) => (old ? { ...old, ...updated } : old));
      }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousIssue) {
        syncIssueCache(() => context.previousIssue);
      }
      toast.error('Failed to update labels');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      if (effectiveId !== issueId) qc.invalidateQueries({ queryKey: ['issue', effectiveId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
    },
  });

  // Release (Fix Version) Mutations
  const createReleaseMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; releaseDate?: string }) =>
      releaseApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-releases', projectId] });
    },
    onError: () => toast.error('Failed to create release'),
  });

  const setReleaseMutation = useMutation({
    mutationFn: (releaseId: string | null) => issueApi.setRelease(effectiveId, releaseId),
    onMutate: async (releaseId) => {
      await qc.cancelQueries({ queryKey: ['issue', issueId] });
      if (effectiveId !== issueId) await qc.cancelQueries({ queryKey: ['issue', effectiveId] });
      const previousIssue = qc.getQueryData(['issue', issueId]);

      const rel = projectReleases.find((r) => r.id === releaseId);
      syncIssueCache((old) =>
        old
          ? {
              ...old,
              releaseId: releaseId ?? undefined,
              releaseName: rel?.name ?? undefined,
            }
          : old
      );
      return { previousIssue };
    },
    onSuccess: (res) => {
      const updated = res?.data;
      if (updated) {
        syncIssueCache((old) => (old ? { ...old, ...updated } : old));
      }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousIssue) {
        syncIssueCache(() => context.previousIssue);
      }
      toast.error('Failed to update release');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      if (effectiveId !== issueId) qc.invalidateQueries({ queryKey: ['issue', effectiveId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
    },
  });

  // Set Components Mutation
  const setComponentsMutation = useMutation({
    mutationFn: (componentIds: string[]) => issueApi.setComponents(effectiveId, componentIds),
    onMutate: async (componentIds) => {
      await qc.cancelQueries({ queryKey: ['issue', issueId] });
      if (effectiveId !== issueId) await qc.cancelQueries({ queryKey: ['issue', effectiveId] });
      const previousIssue = qc.getQueryData(['issue', issueId]);

      const selectedComponents = projectComponents.filter((c) => componentIds.includes(c.id));
      syncIssueCache((old) => (old ? { ...old, components: selectedComponents } : old));
      return { previousIssue };
    },
    onSuccess: (res) => {
      const updated = res?.data;
      if (updated) {
        syncIssueCache((old) => (old ? { ...old, ...updated } : old));
      }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousIssue) {
        syncIssueCache(() => context.previousIssue);
      }
      toast.error('Failed to update components');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      if (effectiveId !== issueId) qc.invalidateQueries({ queryKey: ['issue', effectiveId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      qc.invalidateQueries({ queryKey: ['project-components', projectId] });
    },
  });

  // Status Update Mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: IssueStatus) => issueApi.updateStatus(effectiveId, status),
    onMutate: async (status) => {
      await qc.cancelQueries({ queryKey: ['issue', issueId] });
      if (effectiveId !== issueId) await qc.cancelQueries({ queryKey: ['issue', effectiveId] });
      const previousIssue = qc.getQueryData(['issue', issueId]);

      syncIssueCache((old) => (old ? { ...old, status } : old));
      return { previousIssue };
    },
    onSuccess: (res) => {
      const updated = res?.data;
      if (updated) {
        syncIssueCache((old) => (old ? { ...old, ...updated } : old));
      }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousIssue) {
        syncIssueCache(() => context.previousIssue);
      }
      toast.error('Failed to update status');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      if (effectiveId !== issueId) qc.invalidateQueries({ queryKey: ['issue', effectiveId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => issueApi.delete(effectiveId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Issue deleted');
      onClose?.();
    },
    onError: () => toast.error('Failed to delete issue'),
  });

  // Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: (content: string) => issueApi.addComment(effectiveId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issue-comments', effectiveId] });
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      if (effectiveId !== issueId) qc.invalidateQueries({ queryKey: ['issue', effectiveId] });
      toast.success('Comment added');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  // Create Subtask Mutation
  const createSubtaskMutation = useMutation({
    mutationFn: (title: string) => {
      const issueTypes = issueTypesRes?.data || [];
      const statuses = statusesRes?.data || [];
      const priorities = prioritiesRes?.data || [];

      const subtaskType = issueTypes.find((t: any) => t.name.toUpperCase() === 'SUBTASK');
      const todoStatus = statuses.find((s: any) => s.name.toUpperCase() === 'TO DO' || s.extra === 'TODO');
      const medPrio = priorities.find((p: any) => p.name.toUpperCase() === 'MEDIUM');

      return issueApi.create(projectId, {
        title,
        type: 'SUBTASK',
        parentId: effectiveId,
        priority: 'MEDIUM',
        issueTypeId: subtaskType?.id,
        statusId: todoStatus?.id,
        priorityId: medPrio?.id,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      if (effectiveId !== issueId) qc.invalidateQueries({ queryKey: ['issue', effectiveId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      setAddingSubtask(false);
      toast.success('Subtask added');
    },
    onError: () => toast.error('Failed to create subtask'),
  });

  // Toggle Subtask Completion Mutation
  const toggleSubtaskMutation = useMutation({
    mutationFn: ({ subId, done }: { subId: string; done: boolean }) =>
      issueApi.updateStatus(subId, done ? 'DONE' : 'TODO'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
    },
  });

  // Calculate Navigation & Parent
  const currentIndex = issues.findIndex((it) => it.id === issueId || it.key === issueId);
  const prevIssue = currentIndex > 0 ? issues[currentIndex - 1] : null;
  const nextIssue = currentIndex >= 0 && currentIndex < issues.length - 1 ? issues[currentIndex + 1] : null;
  const parentIssue = issues.find((it) => it.id === issue?.parentId);

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#626f86' }}>
        <div
          style={{
            display: 'inline-block',
            width: 24,
            height: 24,
            border: '2px solid rgba(0,0,0,0.1)',
            borderTopColor: '#0c66e4',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: 8,
          }}
        />
        <div>Loading task details...</div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#626f86' }}>
        Task not found or has been removed.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
        color: '#172b4d',
        fontFamily: 'var(--font-sans)',
        fontSize: '0.875rem',
      }}
    >
      {/* ─── Top Header ─────────────────────────────────────────── */}
      <TaskDetailHeader
        issue={issue}
        projectId={projectId}
        viewMode={viewMode}
        onToggleViewMode={onToggleViewMode}
        onClose={onClose}
        prevIssue={prevIssue}
        nextIssue={nextIssue}
        onNavigateIssue={onNavigateIssue}
        onDeleteIssue={() => deleteMutation.mutate()}
        projectName={project?.name}
        parentKey={parentIssue?.key}
      />

      {/* ─── Scrollable Body ─────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: viewMode === 'modal' ? '20px 32px 100px 32px' : viewMode === 'full-page' ? '24px 36px 120px 36px' : '16px 20px 100px 20px',
        }}
      >
        {/* Right-bar Breadcrumb */}
        {viewMode === 'right-bar' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#626f86', fontSize: '0.8125rem', marginBottom: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <Plus size={13} /> Add epic
            </span>
            <span>/</span>
            <Link
              href={`/projects/${projectId}/issues/${issue.key}`}
              title="Open full page"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
                color: '#0052cc',
                textDecoration: 'none',
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: 'rgba(9, 30, 66, 0.04)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
                e.currentTarget.style.backgroundColor = 'rgba(9, 30, 66, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
                e.currentTarget.style.backgroundColor = 'rgba(9, 30, 66, 0.04)';
              }}
            >
              <span>{issue.key}</span>
            </Link>
          </div>
        )}

        {/* 2-Column or Stacked Grid depending on View Mode */}
        <div
          style={{
            maxWidth: viewMode === 'full-page' ? 1280 : undefined,
            margin: viewMode === 'full-page' ? '0 auto' : undefined,
            width: '100%',
            display: 'grid',
            gridTemplateColumns: viewMode === 'modal' || viewMode === 'full-page' ? '1fr 360px' : '1fr',
            gap: viewMode === 'modal' || viewMode === 'full-page' ? 36 : 24,
          }}
        >
          {/* Left Column: Title, Description, Subtasks, Activity */}
          <div>
            <TaskTitleAndActions
              issue={issue}
              viewMode={viewMode}
              onUpdateTitle={(title) => updateMutation.mutate({ title })}
              isUpdatingTitle={updateMutation.isPending}
              onOpenAddSubtask={() => setAddingSubtask(true)}
              onOpenAiAssistant={() => setAiModalOpen(true)}
              onUpdateStatus={(status) => updateStatusMutation.mutate(status)}
            />

            <TaskDescription
              description={issue.description}
              projectId={projectId}
              onUpdateDescription={(description) => updateMutation.mutate({ description })}
              isUpdating={updateMutation.isPending}
            />

            <TaskSubtasks
              subtasks={issue.children || []}
              isAddingSubtask={addingSubtask}
              onOpenAddSubtask={() => setAddingSubtask(true)}
              onCloseAddSubtask={() => setAddingSubtask(false)}
              onCreateSubtask={(title) => createSubtaskMutation.mutate(title)}
              isCreatingSubtask={createSubtaskMutation.isPending}
              onToggleSubtask={(subId, done) => toggleSubtaskMutation.mutate({ subId, done })}
            />

            {/* Linked work items */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#44546f', marginBottom: 8 }}>
                Linked work items
              </h3>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px 8px',
                  borderRadius: 4,
                  color: '#44546f',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f2f4')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Plus size={14} />
                <span>Add linked work item</span>
              </button>
            </div>

            {/* Confluence content */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: '#44546f' }}>
                  <span>Confluence content</span>
                  <span style={{ fontSize: '0.75rem', color: '#626f86', cursor: 'help' }}>ⓘ</span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 6,
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={16} color="#0c66e4" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#172b4d' }}>Product requirements</span>
                </div>
                <button
                  type="button"
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    border: 'none',
                    backgroundColor: '#f3e8ff',
                    color: '#6b21a8',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e9d5ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3e8ff')}
                >
                  Try template
                </button>
              </div>
            </div>

            <TaskActivity
              comments={commentsQuery.data ?? issue.comments ?? []}
              history={history}
              projectId={projectId}
              onAddComment={(content) => addCommentMutation.mutate(content)}
              isAddingComment={addCommentMutation.isPending}
            />
          </div>

          {/* Right Column / Sidebar */}
          <TaskDetailsSidebar
            issue={issue}
            members={members}
            viewMode={viewMode}
            issues={issues}
            projectLabels={projectLabels}
            projectReleases={projectReleases}
            onUpdateStatus={(status) => updateStatusMutation.mutate(status)}
            onUpdatePriority={(priority) => updateMutation.mutate({ priority })}
            onUpdateAssignee={(assigneeId) => updateMutation.mutate({ assigneeId })}
            onUpdateStoryPoints={(storyPoints) => updateMutation.mutate({ storyPoints })}
            onUpdateStartDate={(startDate) =>
              updateDatesMutation.mutate({ startDate, dueDate: issue.dueDate ?? null })
            }
            onUpdateDueDate={(dueDate) =>
              updateDatesMutation.mutate({ startDate: issue.startDate ?? null, dueDate })
            }
            onUpdateParent={(parentId) => updateParentMutation.mutate(parentId)}
            onSetLabels={(labelIds) => setLabelsMutation.mutate(labelIds)}
            onSetRelease={(releaseId) => setReleaseMutation.mutate(releaseId)}
            projectComponents={projectComponents}
            onSetComponents={(ids) => setComponentsMutation.mutate(ids)}
            onCreateRelease={(data) =>
              new Promise((resolve, reject) => {
                createReleaseMutation.mutate(data, { onSuccess: resolve, onError: reject });
              })
            }
            onCreateLabel={(name) =>
              new Promise((resolve, reject) => {
                createLabelMutation.mutate(name, { onSuccess: resolve, onError: reject });
              })
            }
            onOpenAiAssistant={() => setAiModalOpen(true)}
          />
        </div>
      </div>

      {/* ─── AI Modal (Improve Task) ───────────────────────────────── */}
      <TaskAiModal
        open={aiModalOpen}
        issueTitle={issue.title}
        onClose={() => setAiModalOpen(false)}
        onApplyCriteria={() => {
          setAiModalOpen(false);
          const criteriaText = `\n\n### Acceptance Criteria\n- [ ] Criteria 1\n- [ ] Criteria 2`;
          updateMutation.mutate({ description: (issue.description || '') + criteriaText });
          toast.success('Added AI suggested criteria!');
        }}
      />
    </div>
  );
}
