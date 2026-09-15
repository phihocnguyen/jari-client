'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { issueApi } from '@/lib/api/issue';
import { projectApi } from '@/lib/api/project';
import { sprintApi } from '@/lib/api/sprint';
import { refApi } from '@/lib/api/ref';
import { toast } from '@/components/ui/Toast';
import { createIssueSchema, type CreateIssueFormData } from '@/lib/validations/issue';
import type { IssueType } from '@/types/issue';
import { CreateIssueForm } from './create/CreateIssueForm';

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  initialParentId?: string;
  initialParentTitle?: string;
  initialParentKey?: string;
  initialType?: IssueType;
  initialSprintId?: string;
}

export function CreateIssueModal({
  open,
  onClose,
  projectId,
  initialParentId,
  initialParentTitle,
  initialParentKey,
  initialType,
  initialSprintId,
}: Props) {
  const qc = useQueryClient();
  const [createAnother, setCreateAnother] = useState(false);

  // 1. Fetch Reference Data (Issue Types, Statuses, Priorities)
  const { data: issueTypesRes } = useQuery({
    queryKey: ['ref', 'issue-types'],
    queryFn: () => refApi.getIssueTypes(),
    enabled: open,
    staleTime: 1000 * 60 * 30,
  });

  const { data: statusesRes } = useQuery({
    queryKey: ['ref', 'statuses'],
    queryFn: () => refApi.getStatuses(),
    enabled: open,
    staleTime: 1000 * 60 * 30,
  });

  const { data: prioritiesRes } = useQuery({
    queryKey: ['ref', 'priorities'],
    queryFn: () => refApi.getPriorities(),
    enabled: open,
    staleTime: 1000 * 60 * 30,
  });

  // 2. Fetch Project Members for Assignee
  const { data: members = [] } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => (projectId ? projectApi.listMembers(projectId).then((r) => r.data) : []),
    enabled: open && Boolean(projectId),
  });

  // 3. Fetch Project Sprints
  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => (projectId ? sprintApi.list(projectId).then((r) => r.data) : []),
    enabled: open && Boolean(projectId),
  });

  // 4. Fetch Project Issues for Parent/Epic selection
  const { data: existingIssuesPage } = useQuery({
    queryKey: ['issues', projectId, 'parents'],
    queryFn: () => (projectId ? issueApi.list(projectId, { size: 100 }) : null),
    enabled: open && Boolean(projectId),
  });

  const issueTypes = issueTypesRes?.data ?? [];
  const statuses = statusesRes?.data ?? [];
  const priorities = prioritiesRes?.data ?? [];
  const existingIssues = existingIssuesPage?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateIssueFormData>({
    resolver: zodResolver(createIssueSchema) as any,
    defaultValues: {
      type: initialType || 'TASK',
      priority: 'MEDIUM',
      parentId: initialParentId || '',
      sprintId: initialSprintId || '',
    },
  });

  // When modal opens or initial props change, sync form values
  useEffect(() => {
    if (open) {
      if (initialType) setValue('type', initialType);
      if (initialParentId) setValue('parentId', initialParentId);
      if (initialSprintId) setValue('sprintId', initialSprintId);

      // Match default IDs when ref data is loaded
      if (issueTypes.length > 0) {
        const targetTypeName = (initialType || 'TASK').toUpperCase();
        const matchedType = issueTypes.find((t) => t.name.toUpperCase() === targetTypeName);
        if (matchedType) setValue('issueTypeId', matchedType.id);
      }
      if (statuses.length > 0) {
        const matchedStatus = statuses.find(
          (s) => s.name.toUpperCase() === 'TO DO' || s.extra === 'TODO'
        );
        if (matchedStatus) setValue('statusId', matchedStatus.id);
      }
      if (priorities.length > 0) {
        const matchedPrio = priorities.find((p) => p.name.toUpperCase() === 'MEDIUM');
        if (matchedPrio) setValue('priorityId', matchedPrio.id);
      }
    }
  }, [open, initialType, initialParentId, initialSprintId, issueTypes, statuses, priorities, setValue]);

  const selectedType = watch('type');

  // Mutation to create issue
  const mutation = useMutation({
    mutationFn: async (data: CreateIssueFormData) => {
      let finalIssueTypeId = data.issueTypeId;
      if (!finalIssueTypeId && issueTypes.length > 0) {
        const matched = issueTypes.find(
          (t) => t.name.toUpperCase() === (data.type || 'TASK').toUpperCase()
        );
        finalIssueTypeId = matched?.id;
      }

      let finalStatusId = data.statusId;
      if (!finalStatusId && statuses.length > 0) {
        const matched = statuses.find(
          (s) => s.name.toUpperCase() === 'TO DO' || s.extra === 'TODO'
        );
        finalStatusId = matched?.id;
      }

      let finalPriorityId = data.priorityId;
      if (!finalPriorityId && priorities.length > 0) {
        const matched = priorities.find(
          (p) => p.name.toUpperCase() === (data.priority || 'MEDIUM').toUpperCase()
        );
        finalPriorityId = matched?.id;
      }

      return issueApi.create(projectId, {
        title: data.title,
        description: data.description,
        issueTypeId: finalIssueTypeId,
        statusId: finalStatusId,
        priorityId: finalPriorityId,
        type: data.type,
        priority: data.priority,
        status: 'TODO',
        assigneeId: data.assigneeId || undefined,
        sprintId: data.sprintId || undefined,
        parentId: data.parentId || undefined,
        storyPoints: data.storyPoints != null ? Number(data.storyPoints) : undefined,
        dueDate: data.dueDate || undefined,
      });
    },
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
      qc.invalidateQueries({ queryKey: ['board', projectId], refetchType: 'none' });
      qc.invalidateQueries({ queryKey: ['sprints', projectId], refetchType: 'none' });
      toast.success('Issue created successfully!');

      if (createAnother) {
        setValue('title', '');
        setValue('description', '');
        setValue('storyPoints', undefined);
        setValue('dueDate', '');
      } else {
        reset();
        onClose();
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create issue';
      toast.error(msg);
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create issue"
      size="lg"
      footer={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontSize: '0.84rem',
              color: 'var(--color-text-secondary)',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={createAnother}
              onChange={(e) => setCreateAnother(e.target.checked)}
              style={{
                width: 15,
                height: 15,
                accentColor: 'var(--color-green-brand)',
                cursor: 'pointer',
              }}
            />
            <span>Create another</span>
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button
              loading={mutation.isPending}
              onClick={handleSubmit((d: any) => mutation.mutate(d))}
              style={{
                backgroundColor: 'var(--color-green-brand)',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              Create
            </Button>
          </div>
        </div>
      }
    >
      <CreateIssueForm
        register={register}
        setValue={setValue}
        errors={errors}
        selectedType={selectedType}
        issueTypes={issueTypes}
        statuses={statuses}
        priorities={priorities}
        members={members}
        sprints={sprints}
        existingIssues={existingIssues}
        initialParentId={initialParentId}
        initialParentKey={initialParentKey}
        initialParentTitle={initialParentTitle}
        onSubmit={handleSubmit((d: any) => mutation.mutate(d))}
      />
    </Modal>
  );
}
