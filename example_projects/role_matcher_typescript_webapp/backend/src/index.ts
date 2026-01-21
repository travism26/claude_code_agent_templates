import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDatabase, closeDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import logger from './config/logger';
import tasksRouter from './routes/tasks';
import analyticsRouter from './routes/analytics';
import auditRouter from './routes/audit';
import employeesRouter from './routes/employees';
import assignmentsRouter from './routes/assignments';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'AI Task Prioritizer Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/tasks', tasksRouter);
app.use('/analytics', analyticsRouter);
app.use('/audit', auditRouter);
app.use('/employees', employeesRouter);
app.use('/assignments', assignmentsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
function startServer() {
  try {
    // Initialize database
    getDatabase();
    logger.info('Database initialized successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

// Start the server
startServer();

export default app;
