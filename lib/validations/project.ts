import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  projectKey: z
    .string()
    .min(1, 'Project key is required')
    .max(20, 'Project key must be at most 20 characters')
    .regex(/^[A-Z0-9_]+$/, 'Must be uppercase letters, numbers, and underscore only'),
  description: z.string().optional(),
  leadId: z.string().optional(),
  projectType: z.enum(['SOFTWARE', 'BUSINESS', 'SERVICE_DESK']),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name must be at most 100 characters'),
  description: z.string().optional(),
  leadId: z.string().optional(),
  defaultAssignee: z.enum(['UNASSIGNED', 'PROJECT_LEAD']).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'DELETED']).optional(),
});

export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

export const inviteProjectMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  userId: z.string().optional(),
  roleName: z.enum(['PROJECT_ADMIN', 'PROJECT_MEMBER', 'PROJECT_VIEWER']),
}).refine(data => Boolean(data.userId || (data.email && data.email.trim())), {
  message: 'Please select a user or enter an email address',
  path: ['email'],
});

export type InviteProjectMemberFormData = z.infer<typeof inviteProjectMemberSchema>;

