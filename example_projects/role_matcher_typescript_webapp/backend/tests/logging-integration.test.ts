import request from 'supertest';
import express from 'express';
import { requestLogger } from '../src/middleware/requestLogger';
import { errorHandler } from '../src/middleware/errorHandler';
import tasksRouter from '../src/routes/tasks';
import { resetDatabase } from '../src/config/database';
import fs from 'fs';
import path from 'path';
import logger from '../src/config/logger';

// Create test app with logging
const app = express();
app.use(express.json());
app.use(requestLogger);
app.use('/tasks', tasksRouter);
app.use(errorHandler);

describe('Logging Integration Tests', () => {
  const logsDir = path.join(__dirname, '../logs');

  beforeAll(() => {
    process.env.DATABASE_PATH = ':memory:';
  });

  beforeEach(() => {
    resetDatabase();
  });

  describe('End-to-End Request Logging', () => {
    it('should log complete request/response cycle for creating a task', async () => {
      const logSpy = jest.spyOn(logger, 'http');

      const taskData = {
        title: 'Integration Test Task',
        description: 'Testing logging functionality',
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

      // Verify incoming request was logged
      expect(logSpy).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          method: 'POST',
          path: '/tasks',
          url: '/tasks'
        })
      );

      // Verify response was logged
      // Note: path will be "/" because the router is mounted at "/tasks"
      expect(logSpy).toHaveBeenCalledWith(
        'Request completed successfully',
        expect.objectContaining({
          method: 'POST',
          statusCode: 201
        })
      );

      logSpy.mockRestore();
    });

    it('should log GET request for fetching tasks', async () => {
      const logSpy = jest.spyOn(logger, 'http');

      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body.success).toBe(true);

      expect(logSpy).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          method: 'GET',
          path: '/tasks'
        })
      );

      logSpy.mockRestore();
    });

    it('should log error scenarios correctly', async () => {
      const warnSpy = jest.spyOn(logger, 'warn');

      // Send invalid task data (missing required fields)
      const invalidTaskData = {
        title: 'Invalid Task'
        // missing description and other required fields
      };

      await request(app)
        .post('/tasks')
        .send(invalidTaskData)
        .expect(400);

      expect(warnSpy).toHaveBeenCalledWith(
        'Request failed with client error',
        expect.objectContaining({
          statusCode: 400
        })
      );

      warnSpy.mockRestore();
    });
  });

  describe('Multiple Request Types', () => {
    it('should log multiple different HTTP methods', async () => {
      const logSpy = jest.spyOn(logger, 'http');

      // Create a task
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        effort: 3,
        importance: 4,
        category: 'work',
        status: 'pending'
      };

      const createResponse = await request(app)
        .post('/tasks')
        .send(taskData)
        .expect(201);

      const taskId = createResponse.body.data.id;

      // Get tasks
      await request(app).get('/tasks').expect(200);

      // Update task (using PATCH as that's what the router supports)
      await request(app)
        .patch(`/tasks/${taskId}`)
        .send({ title: 'Updated Task' })
        .expect(200);

      // Delete task
      await request(app).delete(`/tasks/${taskId}`).expect(200);

      // Verify all methods were logged
      const calls = logSpy.mock.calls as any[];
      const methods = calls
        .filter(call => typeof call[0] === 'string' && call[0] === 'Incoming request')
        .map(call => call[1]?.method);

      expect(methods).toContain('POST');
      expect(methods).toContain('GET');
      expect(methods).toContain('PATCH');
      expect(methods).toContain('DELETE');

      logSpy.mockRestore();
    });
  });

  describe('Performance Logging', () => {
    it('should log response times for all requests', async () => {
      const logSpy = jest.spyOn(logger, 'http');

      await request(app).get('/tasks').expect(200);

      const calls = logSpy.mock.calls as any[];
      const completedCall = calls.find(
        call => typeof call[0] === 'string' && call[0] === 'Request completed successfully'
      );

      expect(completedCall).toBeDefined();
      expect(completedCall[1]).toHaveProperty('durationMs');
      expect(typeof completedCall[1].durationMs).toBe('number');
      expect(completedCall[1].durationMs).toBeGreaterThanOrEqual(0);

      logSpy.mockRestore();
    });
  });

  describe('Log File Creation', () => {
    it('should create logs directory', () => {
      expect(fs.existsSync(logsDir)).toBe(true);
      expect(fs.statSync(logsDir).isDirectory()).toBe(true);
    });

    it('should create log files in logs directory', async () => {
      // Make a request to trigger logging
      await request(app).get('/tasks').expect(200);

      // Give winston time to write to file
      await new Promise(resolve => setTimeout(resolve, 100));

      const files = fs.readdirSync(logsDir);
      const logFiles = files.filter(f => f.startsWith('api_requests-') && f.endsWith('.log'));

      expect(logFiles.length).toBeGreaterThan(0);
    });
  });

  describe('Request Context', () => {
    it('should log user agent if provided', async () => {
      const logSpy = jest.spyOn(logger, 'http');

      await request(app)
        .get('/tasks')
        .set('User-Agent', 'test-client/1.0')
        .expect(200);

      expect(logSpy).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          userAgent: 'test-client/1.0'
        })
      );

      logSpy.mockRestore();
    });

    it('should log content type for requests with body', async () => {
      const logSpy = jest.spyOn(logger, 'http');

      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        effort: 3,
        importance: 4,
        category: 'work',
        status: 'pending'
      };

      await request(app)
        .post('/tasks')
        .send(taskData)
        .expect(201);

      expect(logSpy).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          contentType: 'application/json'
        })
      );

      logSpy.mockRestore();
    });
  });

  describe('Concurrent Requests', () => {
    it('should log concurrent requests with unique request IDs', async () => {
      const logSpy = jest.spyOn(logger, 'http');

      // Make multiple concurrent requests
      const requests = [
        request(app).get('/tasks'),
        request(app).get('/tasks'),
        request(app).get('/tasks')
      ];

      await Promise.all(requests);

      const calls = logSpy.mock.calls as any[];
      const incomingCalls = calls.filter(
        call => typeof call[0] === 'string' && call[0] === 'Incoming request'
      );

      const requestIds = incomingCalls.map(call => call[1]?.requestId);

      // All request IDs should be unique
      const uniqueIds = new Set(requestIds);
      expect(uniqueIds.size).toBe(incomingCalls.length);

      logSpy.mockRestore();
    });
  });
});
