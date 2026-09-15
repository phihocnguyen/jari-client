import { z } from 'zod';

export const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or less'),
  description: z.string().optional(),
  type: z.enum(['EPIC', 'STORY', 'TASK', 'BUG', 'SUBTASK']).optional(),
  priority: z.enum(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST']).optional(),
  issueTypeId: z.string().optional(),
  statusId: z.string().optional(),
  priorityId: z.string().optional(),
  assigneeId: z.string().optional(),
  sprintId: z.string().optional(),
  parentId: z.string().optional(),
  storyPoints: z.number().min(0).max(100).optional(),
  dueDate: z.string().optional(),
});

export type CreateIssueFormData = z.infer<typeof createIssueSchema>;

export const updateIssueSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  type: z.enum(['EPIC', 'STORY', 'TASK', 'BUG', 'SUBTASK']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
  priority: z.enum(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST']).optional(),
  issueTypeId: z.string().optional(),
  statusId: z.string().optional(),
  priorityId: z.string().optional(),
  assigneeId: z.string().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  storyPoints: z.coerce.number().min(0).max(100).optional().nullable(),
  dueDate: z.string().optional(),
});

export type UpdateIssueFormData = z.infer<typeof updateIssueSchema>;

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
});

export type CommentFormData = z.infer<typeof commentSchema>;
