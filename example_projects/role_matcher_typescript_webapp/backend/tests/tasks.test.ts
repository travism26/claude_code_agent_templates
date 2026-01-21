import request from 'supertest';
import express from 'express';
import tasksRouter from '../src/routes/tasks';
import { errorHandler } from '../src/middleware/errorHandler';
import { resetDatabase } from '../src/config/database';

const app = express();
app.use(express.json());
app.use('/tasks', tasksRouter);
app.use(errorHandler);

describe('Tasks API', () => {
  beforeAll(() => {
    process.env.DATABASE_PATH = ':memory:';
  });

  beforeEach(() => {
    resetDatabase();
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        effort: 3,
        importance: 4,
        category: 'work',
        status: 'pending'
      };

      const response = await request(app)
        .post('/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.priority).toBeGreaterThan(0);
    });

    it('should reject task with missing required fields', async () => {
      const taskData = {
        title: 'Test Task',
        // missing description
        effort: 3,
        importance: 4,
        category: 'work'
      };

      const response = await request(app)
        .post('/tasks')
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject task with invalid effort value', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        effort: 10, // invalid
        importance: 4,
        category: 'work'
      };

      const response = await request(app)
        .post('/tasks')
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should calculate priority automatically', async () => {
      const taskData = {
        title: 'High Priority Task',
        description: 'Important task',
        effort: 1,
        importance: 5,
        category: 'urgent'
      };

      const response = await request(app)
        .post('/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body.data.priority).toBeGreaterThan(10);
    });
  });

  describe('GET /tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await request(app).post('/tasks').send({
        title: 'Task 1',
        description: 'Description 1',
        effort: 2,
        importance: 3,
        category: 'work',
        status: 'pending'
      });

      await request(app).post('/tasks').send({
        title: 'Task 2',
        description: 'Description 2',
        effort: 4,
        importance: 5,
        category: 'urgent',
        status: 'in_progress'
      });

      await request(app).post('/tasks').send({
        title: 'Task 3',
        description: 'Description 3',
        effort: 1,
        importance: 2,
        category: 'personal',
        status: 'completed'
      });
    });

    it('should get all tasks', async () => {
      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(3);
      expect(response.body.data.pagination.total).toBe(3);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/tasks?status=pending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].status).toBe('pending');
    });

    it('should filter tasks by category', async () => {
      const response = await request(app)
        .get('/tasks?category=work')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].category).toBe('work');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/tasks?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks.length).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
    });

    it('should sort tasks by priority', async () => {
      const response = await request(app)
        .get('/tasks?sortBy=priority&sortOrder=desc')
        .expect(200);

      expect(response.body.success).toBe(true);
      const tasks = response.body.data.tasks;
      for (let i = 1; i < tasks.length; i++) {
        expect(tasks[i - 1].priority).toBeGreaterThanOrEqual(tasks[i].priority);
      }
    });
  });

  describe('GET /tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const response = await request(app).post('/tasks').send({
        title: 'Test Task',
        description: 'Test Description',
        effort: 3,
        importance: 4,
        category: 'work'
      });
      taskId = response.body.data.id;
    });

    it('should get a task by id', async () => {
      const response = await request(app)
        .get(`/tasks/${taskId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(taskId);
      expect(response.body.data.title).toBe('Test Task');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/tasks/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task not found');
    });

    it('should return 400 for invalid task id', async () => {
      const response = await request(app)
        .get('/tasks/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const response = await request(app).post('/tasks').send({
        title: 'Test Task',
        description: 'Test Description',
        effort: 3,
        importance: 4,
        category: 'work',
        status: 'pending'
      });
      taskId = response.body.data.id;
    });

    it('should update a task', async () => {
      const updates = {
        title: 'Updated Task',
        status: 'in_progress'
      };

      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Task');
      expect(response.body.data.status).toBe('in_progress');
    });

    it('should recalculate priority when relevant fields change', async () => {
      const originalResponse = await request(app).get(`/tasks/${taskId}`);
      const originalPriority = originalResponse.body.data.priority;

      const updates = {
        importance: 5,
        effort: 1
      };

      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .send(updates)
        .expect(200);

      expect(response.body.data.priority).not.toBe(originalPriority);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .patch('/tasks/99999')
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid updates', async () => {
      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .send({ effort: 10 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const response = await request(app).post('/tasks').send({
        title: 'Test Task',
        description: 'Test Description',
        effort: 3,
        importance: 4,
        category: 'work'
      });
      taskId = response.body.data.id;
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/tasks/${taskId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify task is deleted
      await request(app)
        .get(`/tasks/${taskId}`)
        .expect(404);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/tasks/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
