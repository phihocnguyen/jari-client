'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { issueApi } from '@/lib/api/issue';
import { projectApi } from '@/lib/api/project';
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
  viewMode: 'modal' | 'right-bar';
  onToggleViewMode: () => void;
  onClose: () => void;
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

  // 1. Fetch Issue Details
  const { data: issue, isLoading } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => issueApi.get(issueId).then((r) => r.data),
    enabled: Boolean(issueId),
  });

  // 2. Fetch Project Members
  const { data: members = [] } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectApi.listMembers(projectId).then((r) => r.data),
    enabled: Boolean(projectId),
  });

  // 3. Fetch Issue History
  const { data: history = [] } = useQuery({
    queryKey: ['issue-history', issueId],
    queryFn: () => issueApi.getHistory(issueId).then((r) => r.data),
    enabled: Boolean(issueId),
  });

  // Update Mutation (generic fields)
  const updateMutation = useMutation({
    mutationFn: (data: Record<string, any>) => issueApi.update(issueId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Updated');
    },
    onError: () => toast.error('Failed to update issue'),
  });

  // Status Update Mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: IssueStatus) => issueApi.updateStatus(issueId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => issueApi.delete(issueId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Issue deleted');
      onClose();
    },
    onError: () => toast.error('Failed to delete issue'),
  });

  // Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: (content: string) => issueApi.addComment(issueId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      toast.success('Comment added');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  // Create Subtask Mutation
  const createSubtaskMutation = useMutation({
    mutationFn: (title: string) =>
      issueApi.create(projectId, {
        title,
        type: 'SUBTASK',
        parentId: issueId,
        priority: 'MEDIUM',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
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

  // Calculate Navigation
  const currentIndex = issues.findIndex((it) => it.id === issueId);
  const prevIssue = currentIndex > 0 ? issues[currentIndex - 1] : null;
  const nextIssue = currentIndex >= 0 && currentIndex < issues.length - 1 ? issues[currentIndex + 1] : null;

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
      />

      {/* ─── Scrollable Body ─────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: viewMode === 'modal' ? '20px 32px 100px 32px' : '16px 20px 100px 20px',
        }}
      >
        {/* Right-bar Breadcrumb */}
        {viewMode === 'right-bar' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#626f86', fontSize: '0.8125rem', marginBottom: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <Plus size={13} /> Add epic
            </span>
            <span>/</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#172b4d' }}>
              <span>{issue.key}</span>
            </div>
          </div>
        )}

        {/* 2-Column or Stacked Grid depending on View Mode */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'modal' ? '1fr 360px' : '1fr',
            gap: viewMode === 'modal' ? 36 : 24,
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

            {/* Linked Work Items */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#44546f', marginBottom: 8 }}>
                Linked work items
              </h3>
              <button
                type="button"
                onClick={() => toast.info('Link issue dialog')}
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

            <TaskActivity
              comments={issue.comments || []}
              history={history}
              onAddComment={(content) => addCommentMutation.mutate(content)}
              isAddingComment={addCommentMutation.isPending}
            />
          </div>

          {/* Right Column / Sidebar */}
          <TaskDetailsSidebar
            issue={issue}
            members={members}
            viewMode={viewMode}
            onUpdateStatus={(status) => updateStatusMutation.mutate(status)}
            onUpdatePriority={(priority) => updateMutation.mutate({ priority })}
            onUpdateAssignee={(assigneeId) => updateMutation.mutate({ assigneeId })}
            onUpdateStoryPoints={(storyPoints) => updateMutation.mutate({ storyPoints })}
            onUpdateDueDate={(dueDate) => updateMutation.mutate({ dueDate })}
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
