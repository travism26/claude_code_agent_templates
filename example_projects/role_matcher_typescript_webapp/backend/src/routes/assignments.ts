import { Router, Request, Response } from 'express';
import { AssignmentService } from '../services/assignmentService';
import { EmployeeService } from '../services/employeeService';
import { SkillMatchingService } from '../services/skillMatchingService';
import { validateBody, validateQuery } from '../middleware/validation';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import {
  createAssignmentSchema,
  updateAssignmentStatusSchema,
  queryAssignmentsSchema
} from '../validation/assignmentSchemas';

const router = Router();
const employeeService = new EmployeeService();
const skillMatchingService = new SkillMatchingService();
const assignmentService = new AssignmentService(employeeService, skillMatchingService);

// GET /assignments - List all assignments with pagination and filtering
router.get(
  '/',
  validateQuery(queryAssignmentsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const params = req.query as any;
    const { assignments, pagination } = await assignmentService.getAllAssignments(params);

    res.json({
      success: true,
      data: {
        assignments,
        pagination
      }
    });
  })
);

// GET /assignments/:id - Get a single assignment by ID
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(400, 'Invalid assignment ID');
    }

    try {
      const assignment = await assignmentService.getAssignment(id);
      res.json({
        success: true,
        data: assignment
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new AppError(404, 'Assignment not found');
      }
      throw error;
    }
  })
);

// POST /assignments - Create a new assignment
router.post(
  '/',
  validateBody(createAssignmentSchema),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const assignment = await assignmentService.createAssignment(req.body);

      res.status(201).json({
        success: true,
        data: assignment
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  })
);

// PATCH /assignments/:id/status - Update assignment status
router.patch(
  '/:id/status',
  validateBody(updateAssignmentStatusSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(400, 'Invalid assignment ID');
    }

    try {
      const { status } = req.body;
      const assignment = await assignmentService.updateAssignmentStatus(id, status);

      res.json({
        success: true,
        data: assignment
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new AppError(404, 'Assignment not found');
      }
      throw error;
    }
  })
);

// DELETE /assignments/:id - Delete an assignment
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(400, 'Invalid assignment ID');
    }

    try {
      await assignmentService.deleteAssignment(id);
      res.json({
        success: true,
        message: 'Assignment deleted successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new AppError(404, 'Assignment not found');
      }
      throw error;
    }
  })
);

// GET /assignments/tasks/:taskId/assignments - Get all assignments for a task
router.get(
  '/tasks/:taskId/assignments',
  asyncHandler(async (req: Request, res: Response) => {
    const taskId = parseInt(req.params.taskId);
    if (isNaN(taskId)) {
      throw new AppError(400, 'Invalid task ID');
    }

    const assignments = await assignmentService.getTaskAssignments(taskId);

    res.json({
      success: true,
      data: assignments
    });
  })
);

// GET /assignments/employees/:employeeId/assignments - Get all assignments for an employee
router.get(
  '/employees/:employeeId/assignments',
  asyncHandler(async (req: Request, res: Response) => {
    const employeeId = parseInt(req.params.employeeId);
    if (isNaN(employeeId)) {
      throw new AppError(400, 'Invalid employee ID');
    }

    const { status } = req.query;
    const validStatus = status && ['proposed', 'accepted', 'rejected'].includes(status as string)
      ? (status as 'proposed' | 'accepted' | 'rejected')
      : undefined;

    const assignments = await assignmentService.getEmployeeAssignments(employeeId, validStatus);

    res.json({
      success: true,
      data: assignments
    });
  })
);

// POST /assignments/tasks/:taskId/recommend-employees - Get employee recommendations for a task
router.post(
  '/tasks/:taskId/recommend-employees',
  asyncHandler(async (req: Request, res: Response) => {
    const taskId = parseInt(req.params.taskId);
    if (isNaN(taskId)) {
      throw new AppError(400, 'Invalid task ID');
    }

    const { limit } = req.body;
    const limitNum = limit && typeof limit === 'number' ? limit : 10;

    if (limitNum < 1 || limitNum > 100) {
      throw new AppError(400, 'Limit must be between 1 and 100');
    }

    try {
      const recommendations = await assignmentService.recommendEmployeesForTask(taskId, limitNum);

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new AppError(404, 'Task not found');
      }
      throw error;
    }
  })
);

export default router;
