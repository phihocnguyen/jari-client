'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { releaseApi, type UpdateReleaseData } from '@/lib/api/release';
import { toast } from '@/components/ui/Toast';
import type { Release } from '@/types/issue';

interface EditReleaseModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  release: Release | null;
}

export function EditReleaseModal({ open, onClose, projectId, release }: EditReleaseModalProps) {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateReleaseData>({
    defaultValues: {
      name: release?.name || '',
      description: release?.description || '',
      releaseDate: release?.releaseDate ? release.releaseDate.split('T')[0] : '',
      status: release?.status || 'UNRELEASED',
    },
  });

  useEffect(() => {
    if (release) {
      reset({
        name: release.name || '',
        description: release.description || '',
        releaseDate: release.releaseDate ? release.releaseDate.split('T')[0] : '',
        status: release.status || 'UNRELEASED',
      });
    }
  }, [release, reset]);

  const mutation = useMutation({
    mutationFn: (data: UpdateReleaseData) => {
      if (!release) throw new Error('No release selected');
      return releaseApi.update(release.id, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['releases', projectId] });
      toast.success('Version updated successfully!');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update version');
    },
  });

  if (!release) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit version: ${release.name}`}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-release-form"
            loading={mutation.isPending}
          >
            Save changes
          </Button>
        </div>
      }
    >
      <form
        id="edit-release-form"
        onSubmit={handleSubmit((d) => {
          if (!d.name?.trim()) return;
          mutation.mutate({
            name: d.name.trim(),
            description: d.description?.trim() || '',
            releaseDate: d.releaseDate || undefined,
            status: d.status,
          });
        })}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <Input
          id="edit-release-name"
          label="Version name"
          placeholder="e.g. 1.0.0"
          required
          {...register('name', { required: 'Version name is required' })}
        />

        <Input
          id="edit-release-date"
          label="Release date"
          type="date"
          {...register('releaseDate')}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Status</label>
          <select
            {...register('status')}
            className="input"
            style={{ height: 38, cursor: 'pointer' }}
          >
            <option value="UNRELEASED">Unreleased</option>
            <option value="RELEASED">Released</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Description</label>
          <textarea
            {...register('description')}
            className="input"
            rows={3}
            style={{ resize: 'vertical' }}
            placeholder="Describe this release..."
          />
        </div>
      </form>
    </Modal>
  );
}
