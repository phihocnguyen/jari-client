'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { workspaceApi } from '@/lib/api/workspace';
import { toast } from '@/components/ui/Toast';
import { createWorkspaceSchema, type CreateWorkspaceFormData } from '@/lib/validations/workspace';

interface Props {
  open:    boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ open, onClose }: Props) {
  const qc = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: CreateWorkspaceFormData) => workspaceApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace created!');
      reset();
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create workspace';
      toast.error('Error', msg);
    },
  });

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 32);
    setValue('slug', slug);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create workspace"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            loading={mutation.isPending}
            onClick={handleSubmit(d => mutation.mutate(d))}
          >
            Create workspace
          </Button>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(d => mutation.mutate(d))}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <Input
          id="ws-name"
          label="Workspace name"
          placeholder="My Workspace"
          error={errors.name?.message}
          {...register('name')}
          onChange={handleNameChange}
        />
        <Input
          id="ws-slug"
          label="Slug (URL identifier)"
          placeholder="my-workspace"
          hint="Used in URLs — lowercase, numbers, hyphens only"
          error={errors.slug?.message}
          {...register('slug')}
        />
      </form>
    </Modal>
  );
}
