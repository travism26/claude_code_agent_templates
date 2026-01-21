import request from 'supertest';
import express from 'express';
import tasksRouter from '../src/routes/tasks';
import analyticsRouter from '../src/routes/analytics';
import { errorHandler } from '../src/middleware/errorHandler';
import { resetDatabase } from '../src/config/database';

const app = express();
app.use(express.json());
app.use('/tasks', tasksRouter);
app.use('/analytics', analyticsRouter);
app.use(errorHandler);

describe('Analytics API', () => {
  beforeAll(() => {
    process.env.DATABASE_PATH = ':memory:';
  });

  beforeEach(async () => {
    resetDatabase();

    // Create test tasks
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const today = new Date();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await request(app).post('/tasks').send({
      title: 'Overdue Task',
      description: 'Task that is overdue',
      dueDate: yesterday.toISOString(),
      effort: 2,
      importance: 4,
      category: 'work',
      status: 'pending'
    });

    await request(app).post('/tasks').send({
      title: 'Today Task',
      description: 'Task due today',
      dueDate: today.toISOString(),
      effort: 3,
      importance: 5,
      category: 'urgent',
      status: 'pending'
    });

    await request(app).post('/tasks').send({
      title: 'Future Task 1',
      description: 'Task for tomorrow',
      dueDate: tomorrow.toISOString(),
      effort: 1,
      importance: 3,
      category: 'work',
      status: 'in_progress'
    });

    await request(app).post('/tasks').send({
      title: 'Future Task 2',
      description: 'Another task',
      effort: 4,
      importance: 2,
      category: 'personal',
      status: 'pending'
    });

    await request(app).post('/tasks').send({
      title: 'Completed Task',
      description: 'Already done',
      effort: 5,
      importance: 4,
      category: 'work',
      status: 'completed'
    });
  });

  describe('GET /analytics/categories', () => {
    it('should return task count by category', async () => {
      const response = await request(app)
        .get('/analytics/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      const categories = response.body.data;
      const workCategory = categories.find((c: any) => c.category === 'work');
      expect(workCategory).toBeDefined();
      expect(workCategory.count).toBe(3);
    });

    it('should include all categories', async () => {
      const response = await request(app)
        .get('/analytics/categories')
        .expect(200);

      const categories = response.body.data.map((c: any) => c.category);
      expect(categories).toContain('work');
      expect(categories).toContain('urgent');
      expect(categories).toContain('personal');
    });
  });

  describe('GET /analytics/overdue', () => {
    it('should return overdue tasks', async () => {
      const response = await request(app)
        .get('/analytics/overdue')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(1);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].title).toBe('Overdue Task');
    });

    it('should not include completed tasks', async () => {
      const response = await request(app)
        .get('/analytics/overdue')
        .expect(200);

      const tasks = response.body.data.tasks;
      const completedTasks = tasks.filter((t: any) => t.status === 'completed');
      expect(completedTasks).toHaveLength(0);
    });
  });

  describe('GET /analytics/today', () => {
    it('should return tasks due today', async () => {
      const response = await request(app)
        .get('/analytics/today')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(1);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].title).toBe('Today Task');
    });

    it('should not include completed tasks', async () => {
      const response = await request(app)
        .get('/analytics/today')
        .expect(200);

      const tasks = response.body.data.tasks;
      const completedTasks = tasks.filter((t: any) => t.status === 'completed');
      expect(completedTasks).toHaveLength(0);
    });
  });

  describe('GET /analytics/effort-distribution', () => {
    it('should return effort distribution', async () => {
      const response = await request(app)
        .get('/analytics/effort-distribution')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      const distribution = response.body.data;
      expect(distribution.length).toBeGreaterThan(0);

      distribution.forEach((item: any) => {
        expect(item).toHaveProperty('effort');
        expect(item).toHaveProperty('count');
        expect(item.effort).toBeGreaterThanOrEqual(1);
        expect(item.effort).toBeLessThanOrEqual(5);
      });
    });

    it('should count tasks correctly', async () => {
      const response = await request(app)
        .get('/analytics/effort-distribution')
        .expect(200);

      const distribution = response.body.data;
      const totalCount = distribution.reduce((sum: number, item: any) => sum + item.count, 0);
      expect(totalCount).toBe(5); // Total tasks created
    });
  });

  describe('GET /analytics/summary', () => {
    it('should return summary statistics', async () => {
      const response = await request(app)
        .get('/analytics/summary')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('pending');
      expect(response.body.data).toHaveProperty('inProgress');
      expect(response.body.data).toHaveProperty('completed');
      expect(response.body.data).toHaveProperty('overdue');
      expect(response.body.data).toHaveProperty('dueToday');
    });

    it('should have correct counts', async () => {
      const response = await request(app)
        .get('/analytics/summary')
        .expect(200);

      const summary = response.body.data;
      expect(summary.total).toBe(5);
      expect(summary.pending).toBe(3);
      expect(summary.inProgress).toBe(1);
      expect(summary.completed).toBe(1);
      expect(summary.overdue).toBe(1);
      expect(summary.dueToday).toBe(1);
    });
  });
});
