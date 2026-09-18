import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  workspaceKey: z
    .string()
    .max(20, 'Workspace key must be at most 20 characters')
    .optional()
    .or(z.literal('')),
  description: z.string().optional(),
});

export type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100, 'Name must be at most 100 characters'),
  description: z.string().optional(),
});

export type UpdateWorkspaceFormData = z.infer<typeof updateWorkspaceSchema>;

export const inviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  userId: z.string().optional(),
  roleName: z.enum(['WORKSPACE_ADMIN', 'WORKSPACE_MEMBER', 'WORKSPACE_VIEWER']),
  projectIds: z.array(z.string()).optional(),
}).refine(data => Boolean((data.email && data.email.trim().length > 0) || (data.userId && data.userId.trim().length > 0)), {
  message: 'Please provide either an email or select a user',
  path: ['email'],
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
