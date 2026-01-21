import { Router, Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const analyticsService = new AnalyticsService();

// GET /analytics/categories - Get task count by category
router.get(
  '/categories',
  asyncHandler(async (_req: Request, res: Response) => {
    const categoryCounts = await analyticsService.getCategoryCounts();

    res.json({
      success: true,
      data: categoryCounts
    });
  })
);

// GET /analytics/overdue - Get overdue tasks
router.get(
  '/overdue',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await analyticsService.getOverdueTasks();

    res.json({
      success: true,
      data: result
    });
  })
);

// GET /analytics/today - Get tasks due today
router.get(
  '/today',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await analyticsService.getTodayTasks();

    res.json({
      success: true,
      data: result
    });
  })
);

// GET /analytics/effort-distribution - Get task count by effort level
router.get(
  '/effort-distribution',
  asyncHandler(async (_req: Request, res: Response) => {
    const effortDistribution = await analyticsService.getEffortDistribution();

    res.json({
      success: true,
      data: effortDistribution
    });
  })
);

// GET /analytics/summary - Get overall summary statistics
router.get(
  '/summary',
  asyncHandler(async (_req: Request, res: Response) => {
    const summary = await analyticsService.getSummary();

    res.json({
      success: true,
      data: summary
    });
  })
);

// GET /analytics/skills/distribution - Get skill distribution across employees
router.get(
  '/skills/distribution',
  asyncHandler(async (_req: Request, res: Response) => {
    const distribution = await analyticsService.getSkillDistribution();

    res.json({
      success: true,
      data: distribution
    });
  })
);

// GET /analytics/skills/gaps - Identify tasks requiring skills no employees have
router.get(
  '/skills/gaps',
  asyncHandler(async (_req: Request, res: Response) => {
    const gaps = await analyticsService.getSkillGaps();

    res.json({
      success: true,
      data: gaps
    });
  })
);

// GET /analytics/employees/utilization - Get employee capacity and workload statistics
router.get(
  '/employees/utilization',
  asyncHandler(async (_req: Request, res: Response) => {
    const utilization = await analyticsService.getEmployeeUtilization();

    res.json({
      success: true,
      data: utilization
    });
  })
);

// GET /analytics/assignments/completion-rate - Get assignment acceptance vs rejection rate
router.get(
  '/assignments/completion-rate',
  asyncHandler(async (_req: Request, res: Response) => {
    const completionRate = await analyticsService.getAssignmentCompletionRate();

    res.json({
      success: true,
      data: completionRate
    });
  })
);

// GET /analytics/tasks/unassignable - Get tasks with no qualified employees
router.get(
  '/tasks/unassignable',
  asyncHandler(async (_req: Request, res: Response) => {
    const unassignableTasks = await analyticsService.getUnassignableTasks();

    res.json({
      success: true,
      data: unassignableTasks
    });
  })
);

export default router;
