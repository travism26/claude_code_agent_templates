import { z } from 'zod';

export const createAssignmentSchema = z.object({
  taskId: z.number().int().positive('Task ID must be a positive integer'),
  employeeId: z.number().int().positive('Employee ID must be a positive integer'),
  score: z.number().min(0, 'Score must be between 0 and 100').max(100, 'Score must be between 0 and 100'),
  status: z.enum(['proposed', 'accepted', 'rejected']).default('proposed').optional()
});

export const updateAssignmentStatusSchema = z.object({
  status: z.enum(['proposed', 'accepted', 'rejected'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be one of: proposed, accepted, rejected'
  })
});

export const queryAssignmentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  taskId: z.coerce.number().int().positive().optional(),
  employeeId: z.coerce.number().int().positive().optional(),
  status: z.enum(['proposed', 'accepted', 'rejected']).optional()
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentStatusInput = z.infer<typeof updateAssignmentStatusSchema>;
export type QueryAssignmentsParams = z.infer<typeof queryAssignmentsSchema>;
