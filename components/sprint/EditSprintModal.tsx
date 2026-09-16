'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { sprintApi } from '@/lib/api/sprint';
import { toast } from '@/components/ui/Toast';
import { updateSprintSchema, type UpdateSprintFormData } from '@/lib/validations/sprint';
import type { Sprint } from '@/types/sprint';

interface EditSprintModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  sprint: Sprint | null;
}

export function EditSprintModal({ open, onClose, projectId, sprint }: EditSprintModalProps) {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateSprintFormData>({
    resolver: zodResolver(updateSprintSchema),
    defaultValues: {
      name: sprint?.name || '',
      goal: sprint?.goal || '',
      startDate: sprint?.startDate ? sprint.startDate.split('T')[0] : '',
      endDate: sprint?.endDate ? sprint.endDate.split('T')[0] : '',
    },
  });

  useEffect(() => {
    if (sprint) {
      reset({
        name: sprint.name || '',
        goal: sprint.goal || '',
        startDate: sprint.startDate ? sprint.startDate.split('T')[0] : '',
        endDate: sprint.endDate ? sprint.endDate.split('T')[0] : '',
      });
    }
  }, [sprint, reset]);

  const mutation = useMutation({
    mutationFn: (data: UpdateSprintFormData) => {
      if (!sprint) throw new Error('No sprint selected');
      return sprintApi.update(sprint.id, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] });
      toast.success('Sprint updated!');
      onClose();
    },
    onError: () => toast.error('Failed to update sprint'),
  });

  if (!sprint) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit ${sprint.name}`}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-sprint-form"
            loading={mutation.isPending}
          >
            Update
          </Button>
        </div>
      }
    >
      <form
        id="edit-sprint-form"
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <Input
          id="edit-sprint-name"
          label="Sprint Name"
          placeholder="e.g. Sprint 1"
          error={errors.name?.message}
          {...register('name')}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            id="edit-sprint-start"
            label="Start Date"
            type="date"
            {...register('startDate')}
          />
          <Input
            id="edit-sprint-end"
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
