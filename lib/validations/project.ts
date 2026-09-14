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
  status: z.enum(['ACTIVE', 'ARCHIVED', 'DELETED']).optional(),
});

export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;
