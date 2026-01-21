import request from 'supertest';
import express, { Request, Response } from 'express';
import { requestLogger } from '../src/middleware/requestLogger';
import logger from '../src/config/logger';

// Mock the logger
jest.mock('../src/config/logger', () => ({
  __esModule: true,
  default: {
    http: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  }
}));

describe('Request Logger Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(requestLogger);

    // Clear mock calls
    jest.clearAllMocks();
  });

  describe('Basic Logging', () => {
    it('should log incoming requests', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.json({ message: 'test' });
      });

      await request(app).get('/test').expect(200);

      expect(logger.http).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          method: 'GET',
          path: '/test',
          url: '/test'
        })
      );
    });

    it('should log response details', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.json({ message: 'test' });
      });

      await request(app).get('/test').expect(200);

      expect(logger.http).toHaveBeenCalledWith(
        'Request completed successfully',
        expect.objectContaining({
          method: 'GET',
          path: '/test',
          statusCode: 200
        })
      );
    });

    it('should capture response time', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.json({ message: 'test' });
      });

      await request(app).get('/test').expect(200);

      const lastCall = (logger.http as jest.Mock).mock.calls.find(call =>
        call[0] === 'Request completed successfully'
      );

      expect(lastCall).toBeDefined();
      expect(lastCall[1]).toHaveProperty('duration');
      expect(lastCall[1]).toHaveProperty('durationMs');
      expect(lastCall[1].durationMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('IP Address Extraction', () => {
    it('should extract IP from X-Forwarded-For header', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.json({ message: 'test' });
      });

      await request(app)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.1, 10.0.0.1')
        .expect(200);

      expect(logger.http).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          ip: '192.168.1.1'
        })
      );
    });

    it('should extract IP from X-Real-IP header', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.json({ message: 'test' });
      });

      await request(app)
        .get('/test')
        .set('X-Real-IP', '192.168.1.2')
        .expect(200);

      expect(logger.http).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          ip: '192.168.1.2'
        })
      );
    });

    it('should fall back to socket address when no headers present', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.json({ message: 'test' });
      });

      await request(app).get('/test').expect(200);

      const lastCall = (logger.http as jest.Mock).mock.calls.find(call =>
        call[0] === 'Incoming request'
      );

      expect(lastCall).toBeDefined();
      expect(lastCall[1]).toHaveProperty('ip');
      expect(typeof lastCall[1].ip).toBe('string');
    });
  });

  describe('User ID Extraction', () => {
    it('should extract user ID from X-User-ID header', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.json({ message: 'test' });
      });

      await request(app)
        .get('/test')
        .set('X-User-ID', 'user123')
        .expect(200);

      expect(logger.http).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          userId: 'user123'
        })
      );
    });

    it('should handle missing user ID gracefully', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.json({ message: 'test' });
      });

      await request(app).get('/test').expect(200);

      expect(logger.http).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          userId: undefined
        })
      );
    });
  });

  describe('HTTP Methods', () => {
    it('should log POST requests', async () => {
      app.post('/test', (_req: Request, res: Response) => {
        res.status(201).json({ message: 'created' });
      });

      await request(app)
        .post('/test')
        .send({ data: 'test' })
        .expect(201);

      expect(logger.http).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          method: 'POST',
          path: '/test'
        })
      );
    });

    it('should log PUT requests', async () => {
      app.put('/test/:id', (_req: Request, res: Response) => {
        res.json({ message: 'updated' });
      });

      await request(app)
        .put('/test/123')
        .send({ data: 'test' })
        .expect(200);

      expect(logger.http).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          method: 'PUT',
          path: '/test/123'
        })
      );
    });

    it('should log DELETE requests', async () => {
      app.delete('/test/:id', (_req: Request, res: Response) => {
        res.json({ message: 'deleted' });
      });

      await request(app).delete('/test/123').expect(200);

      expect(logger.http).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          method: 'DELETE',
          path: '/test/123'
        })
      );
    });
  });

  describe('Error Logging', () => {
    it('should log 4xx errors as warnings', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.status(404).json({ error: 'Not found' });
      });

      await request(app).get('/test').expect(404);

      expect(logger.warn).toHaveBeenCalledWith(
        'Request failed with client error',
        expect.objectContaining({
          statusCode: 404,
          error: 'Not found'
        })
      );
    });

    it('should log 5xx errors as errors', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.status(500).json({ error: 'Internal server error' });
      });

      await request(app).get('/test').expect(500);

      expect(logger.error).toHaveBeenCalledWith(
        'Request failed with server error',
        expect.objectContaining({
          statusCode: 500,
          error: 'Internal server error'
        })
      );
    });

    it('should handle errors with message property', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.status(400).json({ message: 'Bad request message' });
      });

      await request(app).get('/test').expect(400);

      expect(logger.warn).toHaveBeenCalledWith(
        'Request failed with client error',
        expect.objectContaining({
          error: 'Bad request message'
        })
      );
    });
  });

  describe('Query Parameters', () => {
    it('should log query parameters', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.json({ message: 'test' });
      });

      await request(app).get('/test?param1=value1&param2=value2').expect(200);

      expect(logger.http).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          query: { param1: 'value1', param2: 'value2' }
        })
      );
    });
  });

  describe('Response Types', () => {
    it('should handle JSON responses', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.json({ data: 'test' });
      });

      await request(app).get('/test').expect(200);

      expect(logger.http).toHaveBeenCalledWith(
        'Request completed successfully',
        expect.objectContaining({
          statusCode: 200
        })
      );
    });

    it('should handle text responses', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.send('plain text response');
      });

      await request(app).get('/test').expect(200);

      expect(logger.http).toHaveBeenCalledWith(
        'Request completed successfully',
        expect.objectContaining({
          statusCode: 200
        })
      );
    });

    it('should handle empty responses', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.status(204).send();
      });

      await request(app).get('/test').expect(204);

      expect(logger.http).toHaveBeenCalledWith(
        'Request completed successfully',
        expect.objectContaining({
          statusCode: 204
        })
      );
    });
  });

  describe('Request ID Generation', () => {
    it('should generate unique request IDs', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.json({ message: 'test' });
      });

      await request(app).get('/test').expect(200);
      await request(app).get('/test').expect(200);

      const incomingCalls = (logger.http as jest.Mock).mock.calls.filter(
        call => call[0] === 'Incoming request'
      );

      expect(incomingCalls.length).toBeGreaterThanOrEqual(2);
      const requestId1 = incomingCalls[0][1].requestId;
      const requestId2 = incomingCalls[1][1].requestId;

      expect(requestId1).toBeDefined();
      expect(requestId2).toBeDefined();
      expect(requestId1).not.toBe(requestId2);
    });

    it('should use same request ID for request and response logs', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.json({ message: 'test' });
      });

      await request(app).get('/test').expect(200);

      const httpCalls = (logger.http as jest.Mock).mock.calls;
      const incomingCall = httpCalls.find(call => call[0] === 'Incoming request');
      const completedCall = httpCalls.find(call => call[0] === 'Request completed successfully');

      expect(incomingCall).toBeDefined();
      expect(completedCall).toBeDefined();
      expect(incomingCall[1].requestId).toBe(completedCall[1].requestId);
    });
  });
});
