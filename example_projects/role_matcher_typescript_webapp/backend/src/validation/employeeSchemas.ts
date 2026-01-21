import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  role: z.string().min(1, 'Role is required'),
  capacity: z.number().min(0, 'Capacity must be between 0 and 100').max(100, 'Capacity must be between 0 and 100').default(100).optional()
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  role: z.string().min(1).optional(),
  capacity: z.number().min(0).max(100).optional()
});

export const addSkillSchema = z.object({
  skillName: z.string().min(1, 'Skill name is required'),
  level: z.number().int().min(1, 'Level must be between 1 and 5').max(5, 'Level must be between 1 and 5')
});

export const updateSkillLevelSchema = z.object({
  level: z.number().int().min(1, 'Level must be between 1 and 5').max(5, 'Level must be between 1 and 5')
});

export const queryEmployeesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  role: z.string().optional().transform((val) => {
    // Sanitize invalid string values that should be treated as undefined
    if (!val || val === 'undefined' || val === 'null' || val.trim() === '') {
      return undefined;
    }
    return val;
  })
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type AddSkillInput = z.infer<typeof addSkillSchema>;
export type UpdateSkillLevelInput = z.infer<typeof updateSkillLevelSchema>;
export type QueryEmployeesParams = z.infer<typeof queryEmployeesSchema>;
