import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  workspaceKey: z
    .string()
    .min(1, 'Workspace key is required')
    .max(20, 'Workspace key must be at most 20 characters')
    .regex(/^[A-Z0-9_]+$/, 'Must be uppercase letters, numbers, and underscore only'),
  description: z.string().optional(),
});

export type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100, 'Name must be at most 100 characters'),
  description: z.string().optional(),
});

export type UpdateWorkspaceFormData = z.infer<typeof updateWorkspaceSchema>;

export const inviteMemberSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  roleName: z.string().min(1, 'Role is required'),
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
