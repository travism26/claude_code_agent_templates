import { AnalyticsService } from '../../src/services/analyticsService';
import { TaskModel } from '../../src/models/Task';
import { Task } from '../../src/types';

jest.mock('../../src/models/Task');

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Overdue Task',
      description: 'Test',
      dueDate: '2023-01-01',
      effort: 3,
      importance: 4,
      category: 'work',
      status: 'pending',
      priority: 10,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      title: 'Today Task',
      description: 'Test',
      dueDate: new Date().toISOString().split('T')[0],
      effort: 2,
      importance: 5,
      category: 'urgent',
      status: 'in_progress',
      priority: 12,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  beforeEach(() => {
    analyticsService = new AnalyticsService();
    jest.clearAllMocks();
  });

  describe('getCategoryCounts', () => {
    it('should return task counts grouped by category', async () => {
      const mockCategoryCounts = [
        { category: 'work', count: 15 },
        { category: 'personal', count: 8 },
        { category: 'urgent', count: 5 }
      ];

      jest.spyOn(TaskModel, 'getCategoryCounts').mockReturnValue(mockCategoryCounts);

      const result = await analyticsService.getCategoryCounts();

      expect(result).toEqual(mockCategoryCounts);
      expect(TaskModel.getCategoryCounts).toHaveBeenCalled();
    });

    it('should return empty array when no tasks exist', async () => {
      jest.spyOn(TaskModel, 'getCategoryCounts').mockReturnValue([]);

      const result = await analyticsService.getCategoryCounts();

      expect(result).toEqual([]);
    });

    it('should handle errors during category count retrieval', async () => {
      jest.spyOn(TaskModel, 'getCategoryCounts').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(analyticsService.getCategoryCounts())
        .rejects.toThrow('Failed to retrieve category statistics');
    });
  });

  describe('getOverdueTasks', () => {
    it('should return overdue tasks with count', async () => {
      const overdueTasks = [mockTasks[0]];
      jest.spyOn(TaskModel, 'findOverdue').mockReturnValue(overdueTasks);

      const result = await analyticsService.getOverdueTasks();

      expect(result).toEqual({
        count: 1,
        tasks: overdueTasks
      });
      expect(TaskModel.findOverdue).toHaveBeenCalled();
    });

    it('should return zero count when no overdue tasks exist', async () => {
      jest.spyOn(TaskModel, 'findOverdue').mockReturnValue([]);

      const result = await analyticsService.getOverdueTasks();

      expect(result).toEqual({
        count: 0,
        tasks: []
      });
    });

    it('should handle errors during overdue task retrieval', async () => {
      jest.spyOn(TaskModel, 'findOverdue').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(analyticsService.getOverdueTasks())
        .rejects.toThrow('Failed to retrieve overdue tasks');
    });
  });

  describe('getTodayTasks', () => {
    it('should return tasks due today with count', async () => {
      const todayTasks = [mockTasks[1]];
      jest.spyOn(TaskModel, 'findDueToday').mockReturnValue(todayTasks);

      const result = await analyticsService.getTodayTasks();

      expect(result).toEqual({
        count: 1,
        tasks: todayTasks
      });
      expect(TaskModel.findDueToday).toHaveBeenCalled();
    });

    it('should return zero count when no tasks are due today', async () => {
      jest.spyOn(TaskModel, 'findDueToday').mockReturnValue([]);

      const result = await analyticsService.getTodayTasks();

      expect(result).toEqual({
        count: 0,
        tasks: []
      });
    });

    it('should handle errors during today tasks retrieval', async () => {
      jest.spyOn(TaskModel, 'findDueToday').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(analyticsService.getTodayTasks())
        .rejects.toThrow('Failed to retrieve tasks due today');
    });
  });

  describe('getEffortDistribution', () => {
    it('should return task distribution by effort level', async () => {
      const mockEffortDistribution = [
        { effort: 1, count: 5 },
        { effort: 2, count: 10 },
        { effort: 3, count: 8 },
        { effort: 4, count: 4 },
        { effort: 5, count: 2 }
      ];

      jest.spyOn(TaskModel, 'getEffortDistribution').mockReturnValue(mockEffortDistribution);

      const result = await analyticsService.getEffortDistribution();

      expect(result).toEqual(mockEffortDistribution);
      expect(TaskModel.getEffortDistribution).toHaveBeenCalled();
    });

    it('should return empty array when no tasks exist', async () => {
      jest.spyOn(TaskModel, 'getEffortDistribution').mockReturnValue([]);

      const result = await analyticsService.getEffortDistribution();

      expect(result).toEqual([]);
    });

    it('should handle errors during effort distribution retrieval', async () => {
      jest.spyOn(TaskModel, 'getEffortDistribution').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(analyticsService.getEffortDistribution())
        .rejects.toThrow('Failed to retrieve effort distribution');
    });
  });

  describe('getSummary', () => {
    it('should return comprehensive analytics summary', async () => {
      jest.spyOn(TaskModel, 'count')
        .mockReturnValueOnce(50) // total
        .mockReturnValueOnce(20) // pending
        .mockReturnValueOnce(15) // in_progress
        .mockReturnValueOnce(15); // completed

      jest.spyOn(TaskModel, 'findOverdue').mockReturnValue([mockTasks[0]]);
      jest.spyOn(TaskModel, 'findDueToday').mockReturnValue([mockTasks[1]]);

      const result = await analyticsService.getSummary();

      expect(result).toEqual({
        total: 50,
        pending: 20,
        inProgress: 15,
        completed: 15,
        overdue: 1,
        dueToday: 1
      });

      expect(TaskModel.count).toHaveBeenCalledTimes(4);
      expect(TaskModel.count).toHaveBeenNthCalledWith(1);
      expect(TaskModel.count).toHaveBeenNthCalledWith(2, { status: 'pending' });
      expect(TaskModel.count).toHaveBeenNthCalledWith(3, { status: 'in_progress' });
      expect(TaskModel.count).toHaveBeenNthCalledWith(4, { status: 'completed' });
      expect(TaskModel.findOverdue).toHaveBeenCalled();
      expect(TaskModel.findDueToday).toHaveBeenCalled();
    });

    it('should handle edge case with all zeros', async () => {
      jest.spyOn(TaskModel, 'count').mockReturnValue(0);
      jest.spyOn(TaskModel, 'findOverdue').mockReturnValue([]);
      jest.spyOn(TaskModel, 'findDueToday').mockReturnValue([]);

      const result = await analyticsService.getSummary();

      expect(result).toEqual({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        dueToday: 0
      });
    });

    it('should handle errors during summary retrieval', async () => {
      jest.spyOn(TaskModel, 'count').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(analyticsService.getSummary())
        .rejects.toThrow('Failed to retrieve analytics summary');
    });

    it('should handle scenario with many overdue tasks', async () => {
      const manyOverdueTasks = Array(25).fill(mockTasks[0]);

      jest.spyOn(TaskModel, 'count')
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(25)
        .mockReturnValueOnce(50)
        .mockReturnValueOnce(25);

      jest.spyOn(TaskModel, 'findOverdue').mockReturnValue(manyOverdueTasks);
      jest.spyOn(TaskModel, 'findDueToday').mockReturnValue([]);

      const result = await analyticsService.getSummary();

      expect(result.overdue).toBe(25);
      expect(result.total).toBe(100);
    });
  });
});
