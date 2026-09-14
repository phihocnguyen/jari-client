'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { projectApi } from '@/lib/api/project';
import { toast } from '@/components/ui/Toast';
import { createProjectSchema, type CreateProjectFormData } from '@/lib/validations/project';

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
}

export function CreateProjectModal({ open, onClose, workspaceId }: Props) {
  const qc = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { projectType: 'SOFTWARE' },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateProjectFormData) => projectApi.create(workspaceId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', workspaceId] });
      toast.success('Project created!');
      reset();
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create project';
      toast.error('Error', msg);
    },
  });

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
            onClick={handleSubmit(d => mutation.mutate(d))}
          >
            Create project
          </Button>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(d => mutation.mutate(d))}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <Input
          id="proj-name"
          label="Project name *"
          placeholder="My Mobile App"
          error={errors.name?.message}
          {...register('name')}
          onChange={handleNameChange}
        />
        <Input
          id="proj-key"
          label="Project Key *"
          placeholder="MOBILE"
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
            placeholder="Add a short description..."
          />
        </div>
      </form>
    </Modal>
  );
}
