'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { issueApi } from '@/lib/api/issue';
import { projectApi } from '@/lib/api/project';
import { toast } from '@/components/ui/Toast';
import { createIssueSchema, type CreateIssueFormData } from '@/lib/validations/issue';

interface Props {
  open:      boolean;
  onClose:   () => void;
  projectId: string;
}

export function CreateIssueModal({ open, onClose, projectId }: Props) {
  const qc = useQueryClient();

  const { data: members = [] } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn:  () => projectApi.listMembers(projectId).then(r => r.data),
    enabled:  open,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateIssueFormData>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: { type: 'TASK', priority: 'MEDIUM' },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateIssueFormData) => issueApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Issue created!');
      reset();
      onClose();
    },
    onError: () => toast.error('Failed to create issue'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create issue"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={mutation.isPending} onClick={handleSubmit(d => mutation.mutate(d))}>
            Create issue
          </Button>
        </>
      }
    >
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input id="iss-title" label="Summary" placeholder="What needs to be done?" error={errors.title?.message} {...register('title')} />
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Issue Type</label>
            <select {...register('type')} className="input" style={{ cursor: 'pointer' }}>
              <option value="TASK">Task</option>
              <option value="STORY">Story</option>
              <option value="BUG">Bug</option>
              <option value="EPIC">Epic</option>
            </select>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Priority</label>
            <select {...register('priority')} className="input" style={{ cursor: 'pointer' }}>
              <option value="HIGHEST">Highest</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="LOWEST">Lowest</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Assignee</label>
          <select {...register('assigneeId')} className="input" style={{ cursor: 'pointer' }}>
            <option value="">Unassigned</option>
            {members.map(m => (
              <option key={m.userId} value={m.userId}>{m.fullName}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Description</label>
          <textarea
            {...register('description')}
            className="input"
            rows={5}
            style={{ resize: 'vertical' }}
            placeholder="Add details about this issue..."
          />
        </div>
      </form>
    </Modal>
  );
}
