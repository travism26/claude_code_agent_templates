import { Router, Request, Response } from 'express';
import { AuditService } from '../services/auditService';
import { validateQuery } from '../middleware/validation';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { auditQueryParamsSchema } from '../validation/taskSchemas';

const router = Router();
const auditService = new AuditService();

// GET /audit - Get all audit logs with pagination and filtering
router.get(
  '/',
  validateQuery(auditQueryParamsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const params = req.query as any;
    const { logs, total } = await auditService.getAuditLogs(params);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          pages: Math.ceil(total / params.limit)
        }
      }
    });
  })
);

// GET /audit/:taskId - Get audit logs for a specific task
router.get(
  '/:taskId',
  asyncHandler(async (req: Request, res: Response) => {
    const taskId = parseInt(req.params.taskId);
    if (isNaN(taskId)) {
      throw new AppError(400, 'Invalid task ID');
    }

    const logs = await auditService.getTaskAuditHistory(taskId);

    res.json({
      success: true,
      data: logs
    });
  })
);

export default router;
