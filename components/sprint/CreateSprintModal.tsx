'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { sprintApi } from '@/lib/api/sprint';
import { toast } from '@/components/ui/Toast';
import { createSprintSchema, type CreateSprintFormData } from '@/lib/validations/sprint';

interface CreateSprintModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export function CreateSprintModal({ open, onClose, projectId }: CreateSprintModalProps) {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSprintFormData>({
    resolver: zodResolver(createSprintSchema),
    defaultValues: { name: 'Sprint 1' },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateSprintFormData) => sprintApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] });
      toast.success('Sprint created!');
      reset();
      onClose();
    },
    onError: () => toast.error('Failed to create sprint'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Sprint"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-sprint-form"
            loading={mutation.isPending}
          >
            Create
          </Button>
        </div>
      }
    >
      <form
        id="create-sprint-form"
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <Input
          id="sprint-name"
          label="Sprint Name"
          placeholder="e.g. Sprint 1"
          error={errors.name?.message}
          {...register('name')}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            id="sprint-start"
            label="Start Date"
            type="date"
            {...register('startDate')}
          />
          <Input
            id="sprint-end"
            label="End Date"
            type="date"
            {...register('endDate')}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Sprint Goal</label>
          <textarea
            {...register('goal')}
            className="input"
            rows={3}
            style={{ resize: 'vertical' }}
            placeholder="What is the goal of this sprint?"
          />
        </div>
      </form>
    </Modal>
  );
}
