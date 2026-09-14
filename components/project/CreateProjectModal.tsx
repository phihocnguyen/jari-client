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
  open:        boolean;
  onClose:     () => void;
  workspaceId: string;
}

export function CreateProjectModal({ open, onClose, workspaceId }: Props) {
  const qc = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
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

  // Auto-generate key from name (e.g. "My Project" → "MP")
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    const key = name
      .split(/\s+/)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('')
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);
    setValue('key', key);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create project"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={mutation.isPending} onClick={handleSubmit(d => mutation.mutate(d))}>
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
          label="Project name"
          placeholder="e.g. My Awesome Project"
          error={errors.name?.message}
          {...register('name')}
          onChange={handleNameChange}
        />
        <Input
          id="proj-key"
          label="Project key"
          placeholder="e.g. MAP"
          hint="Short identifier used in issue keys (MAP-1, MAP-2…)"
          error={errors.key?.message}
          {...register('key')}
          style={{ textTransform: 'uppercase' }}
        />
        <Input
          id="proj-description"
          label="Description (optional)"
          placeholder="What is this project about?"
          error={errors.description?.message}
          {...register('description')}
        />
      </form>
    </Modal>
  );
}
