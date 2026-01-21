import { AuditService } from '../../src/services/auditService';
import { AuditLogModel } from '../../src/models/AuditLog';
import { Task } from '../../src/types';

jest.mock('../../src/models/AuditLog');

describe('AuditService', () => {
  let auditService: AuditService;

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    dueDate: '2024-12-31',
    effort: 3,
    importance: 4,
    category: 'work',
    status: 'pending',
    priority: 10,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    auditService = new AuditService();
    jest.clearAllMocks();
  });

  describe('logTaskCreation', () => {
    it('should create audit log for task creation', async () => {
      const mockCreate = jest.spyOn(AuditLogModel, 'create').mockReturnValue({
        id: 1,
        taskId: 1,
        action: 'create',
        userId: null,
        changes: JSON.stringify({ created: mockTask }),
        timestamp: '2024-01-01T00:00:00Z'
      });

      await auditService.logTaskCreation(1, mockTask);

      expect(mockCreate).toHaveBeenCalledWith({
        taskId: 1,
        action: 'create',
        userId: null,
        changes: JSON.stringify({ created: mockTask })
      });
    });

    it('should handle errors during task creation logging', async () => {
      jest.spyOn(AuditLogModel, 'create').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(auditService.logTaskCreation(1, mockTask))
        .rejects.toThrow('Failed to create audit log for task creation');
    });
  });

  describe('logTaskUpdate', () => {
    it('should create audit log for task update with before/after snapshots', async () => {
      const updatedTask = { ...mockTask, title: 'Updated Task' };
      const mockCreate = jest.spyOn(AuditLogModel, 'create').mockReturnValue({
        id: 2,
        taskId: 1,
        action: 'update',
        userId: null,
        changes: JSON.stringify({ before: mockTask, after: updatedTask }),
        timestamp: '2024-01-01T00:00:00Z'
      });

      await auditService.logTaskUpdate(1, mockTask, updatedTask);

      expect(mockCreate).toHaveBeenCalledWith({
        taskId: 1,
        action: 'update',
        userId: null,
        changes: JSON.stringify({ before: mockTask, after: updatedTask })
      });
    });

    it('should handle errors during task update logging', async () => {
      const updatedTask = { ...mockTask, title: 'Updated Task' };
      jest.spyOn(AuditLogModel, 'create').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(auditService.logTaskUpdate(1, mockTask, updatedTask))
        .rejects.toThrow('Failed to create audit log for task update');
    });
  });

  describe('logTaskDeletion', () => {
    it('should create audit log for task deletion', async () => {
      const mockCreate = jest.spyOn(AuditLogModel, 'create').mockReturnValue({
        id: 3,
        taskId: 1,
        action: 'delete',
        userId: null,
        changes: JSON.stringify({ deleted: mockTask }),
        timestamp: '2024-01-01T00:00:00Z'
      });

      await auditService.logTaskDeletion(1, mockTask);

      expect(mockCreate).toHaveBeenCalledWith({
        taskId: 1,
        action: 'delete',
        userId: null,
        changes: JSON.stringify({ deleted: mockTask })
      });
    });

    it('should handle errors during task deletion logging', async () => {
      jest.spyOn(AuditLogModel, 'create').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(auditService.logTaskDeletion(1, mockTask))
        .rejects.toThrow('Failed to create audit log for task deletion');
    });
  });

  describe('getAuditLogs', () => {
    it('should retrieve audit logs with pagination', async () => {
      const mockLogs = [
        {
          id: 1,
          taskId: 1,
          action: 'create' as const,
          userId: null,
          changes: '{}',
          timestamp: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          taskId: 1,
          action: 'update' as const,
          userId: null,
          changes: '{}',
          timestamp: '2024-01-02T00:00:00Z'
        }
      ];

      jest.spyOn(AuditLogModel, 'findAll').mockReturnValue(mockLogs);
      jest.spyOn(AuditLogModel, 'count').mockReturnValue(2);

      const result = await auditService.getAuditLogs({ page: 1, limit: 10 });

      expect(result).toEqual({
        logs: mockLogs,
        total: 2
      });
      expect(AuditLogModel.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(AuditLogModel.count).toHaveBeenCalledWith({ taskId: undefined, action: undefined });
    });

    it('should retrieve audit logs with filters', async () => {
      const mockLogs = [
        {
          id: 1,
          taskId: 5,
          action: 'create' as const,
          userId: null,
          changes: '{}',
          timestamp: '2024-01-01T00:00:00Z'
        }
      ];

      jest.spyOn(AuditLogModel, 'findAll').mockReturnValue(mockLogs);
      jest.spyOn(AuditLogModel, 'count').mockReturnValue(1);

      const result = await auditService.getAuditLogs({ taskId: 5, action: 'create' });

      expect(result).toEqual({
        logs: mockLogs,
        total: 1
      });
      expect(AuditLogModel.count).toHaveBeenCalledWith({ taskId: 5, action: 'create' });
    });

    it('should handle errors during audit log retrieval', async () => {
      jest.spyOn(AuditLogModel, 'findAll').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(auditService.getAuditLogs({}))
        .rejects.toThrow('Failed to retrieve audit logs');
    });
  });

  describe('getTaskAuditHistory', () => {
    it('should retrieve complete audit history for a task', async () => {
      const mockLogs = [
        {
          id: 1,
          taskId: 1,
          action: 'create' as const,
          userId: null,
          changes: '{}',
          timestamp: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          taskId: 1,
          action: 'update' as const,
          userId: null,
          changes: '{}',
          timestamp: '2024-01-02T00:00:00Z'
        },
        {
          id: 3,
          taskId: 1,
          action: 'delete' as const,
          userId: null,
          changes: '{}',
          timestamp: '2024-01-03T00:00:00Z'
        }
      ];

      jest.spyOn(AuditLogModel, 'findByTaskId').mockReturnValue(mockLogs);

      const result = await auditService.getTaskAuditHistory(1);

      expect(result).toEqual(mockLogs);
      expect(AuditLogModel.findByTaskId).toHaveBeenCalledWith(1);
    });

    it('should handle errors during task history retrieval', async () => {
      jest.spyOn(AuditLogModel, 'findByTaskId').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(auditService.getTaskAuditHistory(1))
        .rejects.toThrow('Failed to retrieve audit history for task 1');
    });

    it('should return empty array for task with no history', async () => {
      jest.spyOn(AuditLogModel, 'findByTaskId').mockReturnValue([]);

      const result = await auditService.getTaskAuditHistory(999);

      expect(result).toEqual([]);
      expect(AuditLogModel.findByTaskId).toHaveBeenCalledWith(999);
    });
  });
});
