import { z } from 'zod';

export const createSprintSchema = z.object({
  name: z.string().min(1, 'Sprint name is required'),
  goal: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateSprintFormData = z.infer<typeof createSprintSchema>;

export const updateSprintSchema = z.object({
  name: z.string().min(1, 'Sprint name is required').optional(),
  goal: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type UpdateSprintFormData = z.infer<typeof updateSprintSchema>;
