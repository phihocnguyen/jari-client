import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(64),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(32)
    .regex(/^[a-z0-9-]+$/, 'Slug: lowercase letters, numbers, hyphens only'),
});

export type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
});

export type UpdateWorkspaceFormData = z.infer<typeof updateWorkspaceSchema>;

export const inviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['WORKSPACE_ADMIN', 'WORKSPACE_MEMBER', 'WORKSPACE_VIEWER']),
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
