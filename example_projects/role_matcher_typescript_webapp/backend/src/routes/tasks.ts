import { Router, Request, Response } from 'express';
import { TaskService } from '../services/taskService';
import { AuditService } from '../services/auditService';
import { validateBody, validateQuery } from '../middleware/validation';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { createTaskSchema, updateTaskSchema, queryParamsSchema } from '../validation/taskSchemas';

const router = Router();
const auditService = new AuditService();
const taskService = new TaskService(auditService);

// GET /tasks - List all tasks with pagination, filtering, and sorting
router.get(
  '/',
  validateQuery(queryParamsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const params = req.query as any;
    const { tasks, pagination } = await taskService.getAllTasks(params);

    res.json({
      success: true,
      data: {
        tasks,
        pagination
      }
    });
  })
);

// GET /tasks/:id - Get a single task by ID
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(400, 'Invalid task ID');
    }

    try {
      const task = await taskService.getTaskById(id);
      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new AppError(404, 'Task not found');
      }
      throw error;
    }
  })
);

// POST /tasks - Create a new task
router.post(
  '/',
  validateBody(createTaskSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const taskData = req.body;
    const task = await taskService.createTask(taskData);

    res.status(201).json({
      success: true,
      data: task
    });
  })
);

// PATCH /tasks/:id - Update a task
router.patch(
  '/:id',
  validateBody(updateTaskSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(400, 'Invalid task ID');
    }

    try {
      const updates = req.body;
      const updatedTask = await taskService.updateTask(id, updates);

      res.json({
        success: true,
        data: updatedTask
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new AppError(404, 'Task not found');
      }
      throw error;
    }
  })
);

// DELETE /tasks/:id - Delete a task
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(400, 'Invalid task ID');
    }

    try {
      await taskService.deleteTask(id);

      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new AppError(404, 'Task not found');
      }
      throw error;
    }
  })
);

// POST /tasks/ai-prioritize - AI-powered task prioritization
router.post(
  '/ai-prioritize',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await taskService.aiPrioritizeTasks();

    res.json({
      success: true,
      data: result
    });
  })
);

export default router;
