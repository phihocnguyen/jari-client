'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { releaseApi, type CreateReleaseData } from '@/lib/api/release';
import { toast } from '@/components/ui/Toast';

interface CreateReleaseModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export function CreateReleaseModal({ open, onClose, projectId }: CreateReleaseModalProps) {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateReleaseData>({
    defaultValues: { name: '', description: '', releaseDate: '' },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateReleaseData) => releaseApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['releases', projectId] });
      toast.success('Release version created!');
      reset();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create release');
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create version"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-release-form"
            loading={mutation.isPending}
          >
            Save
          </Button>
        </div>
      }
    >
      <form
        id="create-release-form"
        onSubmit={handleSubmit((d) => {
          if (!d.name.trim()) return;
          mutation.mutate({
            name: d.name.trim(),
            description: d.description?.trim() || undefined,
            releaseDate: d.releaseDate || undefined,
          });
        })}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <Input
          id="release-name"
          label="Version name"
          placeholder="e.g. 1.0.0 or Sprint 1 Release"
          required
          {...register('name', { required: 'Version name is required' })}
        />

        <Input
          id="release-date"
          label="Release date"
          type="date"
          {...register('releaseDate')}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Description</label>
          <textarea
            {...register('description')}
            className="input"
            rows={3}
            style={{ resize: 'vertical' }}
            placeholder="Describe what is planned or included in this version..."
          />
        </div>
      </form>
    </Modal>
  );
}
