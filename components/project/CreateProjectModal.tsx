'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { projectApi } from '@/lib/api/project';
import { workspaceApi } from '@/lib/api/workspace';
import { toast } from '@/components/ui/Toast';
import { createProjectSchema, type CreateProjectFormData } from '@/lib/validations/project';

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId?: string;
}

export function CreateProjectModal({ open, onClose, workspaceId }: Props) {
  const qc = useQueryClient();

  const { data: workspacesRes, isLoading: isLoadingWorkspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceApi.list(),
    enabled: open,
  });
  const workspaces = workspacesRes?.data || [];

  const [selectedWsId, setSelectedWsId] = useState<string>(workspaceId || '');
  const [wsError, setWsError] = useState<string>('');

  useEffect(() => {
    if (open) {
      setSelectedWsId(workspaceId || '');
      setWsError('');
    }
  }, [open, workspaceId]);

  const activeWorkspaceId = selectedWsId || workspaceId || '';

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { projectType: 'SOFTWARE' },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateProjectFormData) => {
      if (!activeWorkspaceId) throw new Error('Please select a workspace');
      return projectApi.create(activeWorkspaceId, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      if (activeWorkspaceId) {
        qc.invalidateQueries({ queryKey: ['projects', activeWorkspaceId] });
      }
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Project created!');
      reset();
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create project';
      toast.error('Error', msg);
    },
  });

  const handleFormSubmit = (data: CreateProjectFormData) => {
    if (!activeWorkspaceId) {
      setWsError('Please select a workspace');
      return;
    }
    mutation.mutate(data);
  };

  // Auto-generate projectKey from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    const key = name.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '').slice(0, 10);
    setValue('projectKey', key);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create project"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            loading={mutation.isPending}
            disabled={!activeWorkspaceId || workspaces.length === 0}
            onClick={handleSubmit(handleFormSubmit)}
          >
            Create project
          </Button>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {/* Workspace Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
            Workspace *
          </label>
          <select
            value={activeWorkspaceId}
            onChange={(e) => {
              setSelectedWsId(e.target.value);
              if (e.target.value) setWsError('');
            }}
            className="input"
            style={{ cursor: 'pointer' }}
            disabled={mutation.isPending || isLoadingWorkspaces}
          >
            <option value="" disabled>
              {isLoadingWorkspaces ? 'Loading workspaces...' : 'Select workspace'}
            </option>
            {workspaces.map((ws: any) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
          {wsError && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-red)' }}>
              {wsError}
            </span>
          )}
          {!isLoadingWorkspaces && workspaces.length === 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-red)' }}>
              No workspace found. Please create a workspace first.
            </span>
          )}
        </div>

        <Input
          id="proj-name"
          label="Project name *"
          placeholder="Project name"
          error={errors.name?.message}
          {...register('name')}
          onChange={handleNameChange}
        />
        <Input
          id="proj-key"
          label="Project Key *"
          placeholder="Project key"
          hint="Uppercase letters, numbers, and underscores (max 20)"
          error={errors.projectKey?.message}
          {...register('projectKey')}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Project Type</label>
          <select {...register('projectType')} className="input" style={{ cursor: 'pointer' }}>
            <option value="SOFTWARE">Software (Scrum/Kanban)</option>
            <option value="BUSINESS">Business</option>
            <option value="SERVICE_DESK">Service Desk</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Description</label>
          <textarea
            {...register('description')}
            className="input"
            rows={3}
            style={{ resize: 'vertical' }}
            placeholder="Description"
          />
        </div>
      </form>
    </Modal>
  );
}
