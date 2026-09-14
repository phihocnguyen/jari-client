import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(128),
  key: z
    .string()
    .min(1)
    .max(10)
    .regex(/^[A-Z0-9]+$/, 'Key: uppercase letters and numbers only')
    .optional(),
  description: z.string().max(500).optional(),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  key: z
    .string()
    .min(1)
    .max(10)
    .regex(/^[A-Z0-9]+$/)
    .optional(),
  description: z.string().optional(),
});

export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;
