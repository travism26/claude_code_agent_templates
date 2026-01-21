import { TaskService } from '../../src/services/taskService';
import { TaskModel } from '../../src/models/Task';
import { AuditService } from '../../src/services/auditService';
import { calculatePriority, recalculateTaskPriority } from '../../src/services/priorityCalculator';
import { aiPrioritize } from '../../src/services/aiService';
import { Task } from '../../src/types';

jest.mock('../../src/models/Task');
jest.mock('../../src/services/auditService');
jest.mock('../../src/services/priorityCalculator');
jest.mock('../../src/services/aiService');

describe('TaskService', () => {
  let taskService: TaskService;
  let mockAuditService: jest.Mocked<AuditService>;

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
    mockAuditService = {
      logTaskCreation: jest.fn(),
      logTaskUpdate: jest.fn(),
      logTaskDeletion: jest.fn(),
      getAuditLogs: jest.fn(),
      getTaskAuditHistory: jest.fn()
    } as any;

    taskService = new TaskService(mockAuditService);
    jest.clearAllMocks();
  });

  describe('getAllTasks', () => {
    it('should retrieve all tasks with default pagination', async () => {
      const mockTasks = [mockTask];
      jest.spyOn(TaskModel, 'findAll').mockReturnValue(mockTasks);
      jest.spyOn(TaskModel, 'count').mockReturnValue(1);

      const result = await taskService.getAllTasks();

      expect(result).toEqual({
        tasks: mockTasks,
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          pages: 1
        }
      });
      expect(TaskModel.findAll).toHaveBeenCalled();
    });

    it('should retrieve tasks with custom pagination and filters', async () => {
      const mockTasks = [mockTask];
      jest.spyOn(TaskModel, 'findAll').mockReturnValue(mockTasks);
      jest.spyOn(TaskModel, 'count').mockReturnValue(25);

      const result = await taskService.getAllTasks({
        page: 2,
        limit: 10,
        status: 'pending',
        category: 'work',
        sortBy: 'dueDate',
        sortOrder: 'asc'
      });

      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        pages: 3
      });
    });

    it('should handle errors during task retrieval', async () => {
      jest.spyOn(TaskModel, 'findAll').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(taskService.getAllTasks())
        .rejects.toThrow('Failed to retrieve tasks');
    });
  });

  describe('getTaskById', () => {
    it('should retrieve a task by ID', async () => {
      jest.spyOn(TaskModel, 'findById').mockReturnValue(mockTask);

      const result = await taskService.getTaskById(1);

      expect(result).toEqual(mockTask);
      expect(TaskModel.findById).toHaveBeenCalledWith(1);
    });

    it('should throw error when task is not found', async () => {
      jest.spyOn(TaskModel, 'findById').mockReturnValue(null);

      await expect(taskService.getTaskById(999))
        .rejects.toThrow('Task with ID 999 not found');
    });

    it('should handle database errors', async () => {
      jest.spyOn(TaskModel, 'findById').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(taskService.getTaskById(1))
        .rejects.toThrow('Failed to retrieve task 1');
    });
  });

  describe('createTask', () => {
    it('should create a task with calculated priority and log creation', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Description',
        effort: 3,
        importance: 4,
        category: 'work',
        dueDate: '2024-12-31'
      };

      (calculatePriority as jest.Mock).mockReturnValue(10);
      jest.spyOn(TaskModel, 'create').mockReturnValue(mockTask);

      const result = await taskService.createTask(taskData);

      expect(calculatePriority).toHaveBeenCalledWith({
        importance: 4,
        effort: 3,
        dueDate: '2024-12-31',
        category: 'work'
      });

      expect(TaskModel.create).toHaveBeenCalledWith({
        ...taskData,
        priority: 10,
        status: 'pending'
      });

      expect(mockAuditService.logTaskCreation).toHaveBeenCalledWith(mockTask.id, mockTask);
      expect(result).toEqual(mockTask);
    });

    it('should use provided status when creating task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Description',
        effort: 3,
        importance: 4,
        category: 'work',
        status: 'in_progress' as const
      };

      (calculatePriority as jest.Mock).mockReturnValue(10);
      jest.spyOn(TaskModel, 'create').mockReturnValue({ ...mockTask, status: 'in_progress' });

      await taskService.createTask(taskData);

      expect(TaskModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'in_progress' })
      );
    });

    it('should handle null dueDate correctly', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Description',
        effort: 3,
        importance: 4,
        category: 'work',
        dueDate: null
      };

      (calculatePriority as jest.Mock).mockReturnValue(5);
      jest.spyOn(TaskModel, 'create').mockReturnValue({ ...mockTask, dueDate: null });

      await taskService.createTask(taskData);

      expect(calculatePriority).toHaveBeenCalledWith(
        expect.objectContaining({ dueDate: null })
      );
    });

    it('should handle errors during task creation', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Description',
        effort: 3,
        importance: 4,
        category: 'work'
      };

      (calculatePriority as jest.Mock).mockReturnValue(10);
      jest.spyOn(TaskModel, 'create').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(taskService.createTask(taskData))
        .rejects.toThrow('Failed to create task');
    });
  });

  describe('updateTask', () => {
    it('should update task and recalculate priority when relevant fields change', async () => {
      const updates = {
        importance: 5,
        effort: 2
      };

      const updatedTask = { ...mockTask, importance: 5, effort: 2, priority: 12 };

      jest.spyOn(TaskModel, 'findById').mockReturnValue(mockTask);
      (recalculateTaskPriority as jest.Mock).mockReturnValue(12);
      jest.spyOn(TaskModel, 'update').mockReturnValue(updatedTask);

      const result = await taskService.updateTask(1, updates);

      expect(recalculateTaskPriority).toHaveBeenCalledWith({
        importance: 5,
        effort: 2,
        dueDate: mockTask.dueDate,
        category: mockTask.category
      });

      expect(TaskModel.update).toHaveBeenCalledWith(1, {
        ...updates,
        priority: 12
      });

      expect(mockAuditService.logTaskUpdate).toHaveBeenCalledWith(1, mockTask, updatedTask);
      expect(result).toEqual(updatedTask);
    });

    it('should update task without recalculating priority when irrelevant fields change', async () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated Description'
      };

      const updatedTask = { ...mockTask, ...updates };

      jest.spyOn(TaskModel, 'findById').mockReturnValue(mockTask);
      jest.spyOn(TaskModel, 'update').mockReturnValue(updatedTask);

      await taskService.updateTask(1, updates);

      expect(recalculateTaskPriority).not.toHaveBeenCalled();
      expect(TaskModel.update).toHaveBeenCalledWith(1, updates);
    });

    it('should handle dueDate being set to null', async () => {
      const updates = {
        dueDate: null
      };

      const updatedTask = { ...mockTask, dueDate: null };

      jest.spyOn(TaskModel, 'findById').mockReturnValue(mockTask);
      (recalculateTaskPriority as jest.Mock).mockReturnValue(8);
      jest.spyOn(TaskModel, 'update').mockReturnValue(updatedTask);

      await taskService.updateTask(1, updates);

      expect(recalculateTaskPriority).toHaveBeenCalledWith(
        expect.objectContaining({ dueDate: null })
      );
    });

    it('should throw error when task is not found', async () => {
      jest.spyOn(TaskModel, 'findById').mockReturnValue(null);

      await expect(taskService.updateTask(999, { title: 'New Title' }))
        .rejects.toThrow('Task with ID 999 not found');
    });

    it('should handle errors during task update', async () => {
      jest.spyOn(TaskModel, 'findById').mockReturnValue(mockTask);
      jest.spyOn(TaskModel, 'update').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(taskService.updateTask(1, { title: 'New Title' }))
        .rejects.toThrow('Failed to update task 1');
    });
  });

  describe('deleteTask', () => {
    it('should delete task and log deletion', async () => {
      jest.spyOn(TaskModel, 'findById').mockReturnValue(mockTask);
      jest.spyOn(TaskModel, 'delete').mockReturnValue(true);

      await taskService.deleteTask(1);

      expect(TaskModel.delete).toHaveBeenCalledWith(1);
      expect(mockAuditService.logTaskDeletion).toHaveBeenCalledWith(1, mockTask);
    });

    it('should throw error when task is not found', async () => {
      jest.spyOn(TaskModel, 'findById').mockReturnValue(null);

      await expect(taskService.deleteTask(999))
        .rejects.toThrow('Task with ID 999 not found');
    });

    it('should throw error when deletion fails', async () => {
      jest.spyOn(TaskModel, 'findById').mockReturnValue(mockTask);
      jest.spyOn(TaskModel, 'delete').mockReturnValue(false);

      await expect(taskService.deleteTask(1))
        .rejects.toThrow('Failed to delete task 1');
    });

    it('should handle database errors', async () => {
      jest.spyOn(TaskModel, 'findById').mockReturnValue(mockTask);
      jest.spyOn(TaskModel, 'delete').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(taskService.deleteTask(1))
        .rejects.toThrow('Failed to delete task 1');
    });
  });

  describe('aiPrioritizeTasks', () => {
    it('should call AI service with pending tasks', async () => {
      const pendingTasks = [mockTask];
      const mockAIResponse = {
        rerankedTasks: [{ taskId: 1, newPriority: 15, justification: 'High priority' }],
        missingSuggestions: ['Consider adding deadline'],
        identifiedRisks: ['Overdue task']
      };

      jest.spyOn(TaskModel, 'findAll').mockReturnValue(pendingTasks);
      (aiPrioritize as jest.Mock).mockResolvedValue(mockAIResponse);

      const result = await taskService.aiPrioritizeTasks();

      expect(TaskModel.findAll).toHaveBeenCalledWith({
        status: 'pending',
        sortBy: 'priority',
        sortOrder: 'desc',
        limit: 50
      });

      expect(aiPrioritize).toHaveBeenCalledWith(pendingTasks);
      expect(result).toEqual(mockAIResponse);
    });

    it('should return empty response when no pending tasks exist', async () => {
      jest.spyOn(TaskModel, 'findAll').mockReturnValue([]);

      const result = await taskService.aiPrioritizeTasks();

      expect(result).toEqual({
        rerankedTasks: [],
        missingSuggestions: ['No pending tasks to prioritize'],
        identifiedRisks: []
      });

      expect(aiPrioritize).not.toHaveBeenCalled();
    });

    it('should handle AI service errors', async () => {
      const pendingTasks = [mockTask];
      jest.spyOn(TaskModel, 'findAll').mockReturnValue(pendingTasks);
      (aiPrioritize as jest.Mock).mockRejectedValue(new Error('AI service unavailable'));

      await expect(taskService.aiPrioritizeTasks())
        .rejects.toThrow('Failed to perform AI prioritization');
    });

    it('should limit to 50 tasks for AI prioritization', async () => {
      const manyTasks = Array(100).fill(mockTask);
      jest.spyOn(TaskModel, 'findAll').mockReturnValue(manyTasks);
      (aiPrioritize as jest.Mock).mockResolvedValue({
        rerankedTasks: [],
        missingSuggestions: [],
        identifiedRisks: []
      });

      await taskService.aiPrioritizeTasks();

      expect(TaskModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50 })
      );
    });
  });
});
