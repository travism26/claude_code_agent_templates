import { z } from 'zod';

export const skillRequirementSchema = z.object({
  skillName: z.string().min(1, 'Skill name is required'),
  minLevel: z.number().int().min(1, 'Minimum level must be between 1 and 5').max(5, 'Minimum level must be between 1 and 5')
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().datetime().nullable().optional(),
  effort: z.number().int().min(1, 'Effort must be between 1 and 5').max(5, 'Effort must be between 1 and 5'),
  importance: z.number().int().min(1, 'Importance must be between 1 and 5').max(5, 'Importance must be between 1 and 5'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  requiredSkills: z.array(skillRequirementSchema).optional()
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  effort: z.number().int().min(1).max(5).optional(),
  importance: z.number().int().min(1).max(5).optional(),
  category: z.string().min(1).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  requiredSkills: z.array(skillRequirementSchema).optional()
});

export const queryParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  sortBy: z.enum(['priority', 'dueDate', 'createdAt', 'updatedAt', 'title', 'effort', 'importance']).default('priority'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  category: z.string().optional(),
  minPriority: z.coerce.number().optional(),
  maxPriority: z.coerce.number().optional()
});

export const auditQueryParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  taskId: z.coerce.number().int().optional(),
  action: z.enum(['create', 'update', 'delete']).optional()
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type QueryParams = z.infer<typeof queryParamsSchema>;
export type AuditQueryParams = z.infer<typeof auditQueryParamsSchema>;
