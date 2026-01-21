import request from 'supertest';
import express from 'express';
import employeesRouter from '../src/routes/employees';
import assignmentsRouter from '../src/routes/assignments';
import tasksRouter from '../src/routes/tasks';
import analyticsRouter from '../src/routes/analytics';
import { errorHandler } from '../src/middleware/errorHandler';
import { resetDatabase } from '../src/config/database';

const app = express();
app.use(express.json());
app.use('/employees', employeesRouter);
app.use('/assignments', assignmentsRouter);
app.use('/tasks', tasksRouter);
app.use('/analytics', analyticsRouter);
app.use(errorHandler);

describe('Employee and Assignment Endpoints - Integration Test', () => {
  beforeAll(() => {
    process.env.DATABASE_PATH = ':memory:';
  });

  beforeEach(() => {
    resetDatabase();
  });

  describe('Employee Endpoints', () => {
    it('should create a new employee', async () => {
      const response = await request(app)
        .post('/employees')
        .send({
          name: 'John Doe',
          role: 'Developer',
          capacity: 80
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('John Doe');
      expect(response.body.data.role).toBe('Developer');
      expect(response.body.data.capacity).toBe(80);
    });

    it('should get all employees', async () => {
      await request(app)
        .post('/employees')
        .send({ name: 'John Doe', role: 'Developer' });

      const response = await request(app).get('/employees');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.employees).toHaveLength(1);
    });

    it('should add a skill to an employee', async () => {
      const createResponse = await request(app)
        .post('/employees')
        .send({ name: 'John Doe', role: 'Developer' });

      const employeeId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/employees/${employeeId}/skills`)
        .send({
          skillName: 'Python',
          level: 4
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.skillName).toBe('Python');
      expect(response.body.data.level).toBe(4);
    });
  });

  describe('Assignment Endpoints', () => {
    it('should create a task with required skills and get recommendations', async () => {
      // Create an employee with Python skill and available capacity
      const empResponse = await request(app)
        .post('/employees')
        .send({ name: 'Jane Smith', role: 'Developer', capacity: 80 });

      const employeeId = empResponse.body.data.id;

      await request(app)
        .post(`/employees/${employeeId}/skills`)
        .send({ skillName: 'Python', level: 4 });

      // Create a task with Python requirement
      const taskResponse = await request(app)
        .post('/tasks')
        .send({
          title: 'Build API',
          description: 'Build REST API',
          effort: 3,
          importance: 4,
          category: 'work',
          requiredSkills: [
            { skillName: 'Python', minLevel: 3 }
          ]
        });

      const taskId = taskResponse.body.data.id;

      // Get recommendations
      const recResponse = await request(app)
        .post(`/assignments/tasks/${taskId}/recommend-employees`)
        .send({ limit: 10 });

      expect(recResponse.status).toBe(200);
      expect(recResponse.body.success).toBe(true);
      expect(recResponse.body.data).toBeInstanceOf(Array);
      expect(recResponse.body.data.length).toBeGreaterThan(0);
      expect(recResponse.body.data[0].employeeId).toBe(employeeId);
      expect(recResponse.body.data[0].matchScore).toBeGreaterThan(0);
    });

    it('should create an assignment', async () => {
      // Create employee
      const empResponse = await request(app)
        .post('/employees')
        .send({ name: 'John Doe', role: 'Developer' });

      const employeeId = empResponse.body.data.id;

      // Create task
      const taskResponse = await request(app)
        .post('/tasks')
        .send({
          title: 'Test Task',
          description: 'Test',
          effort: 2,
          importance: 3,
          category: 'work'
        });

      const taskId = taskResponse.body.data.id;

      // Create assignment
      const assignmentResponse = await request(app)
        .post('/assignments')
        .send({
          taskId,
          employeeId,
          score: 85
        });

      expect(assignmentResponse.status).toBe(201);
      expect(assignmentResponse.body.success).toBe(true);
      expect(assignmentResponse.body.data.taskId).toBe(taskId);
      expect(assignmentResponse.body.data.employeeId).toBe(employeeId);
      expect(assignmentResponse.body.data.score).toBe(85);
    });
  });

  describe('Analytics Endpoints', () => {
    it('should get skill distribution', async () => {
      const response = await request(app).get('/analytics/skills/distribution');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should get employee utilization', async () => {
      const response = await request(app).get('/analytics/employees/utilization');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should get assignment completion rate', async () => {
      const response = await request(app).get('/analytics/assignments/completion-rate');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('proposed');
      expect(response.body.data).toHaveProperty('accepted');
      expect(response.body.data).toHaveProperty('rejected');
      expect(response.body.data).toHaveProperty('acceptanceRate');
    });
  });
});
