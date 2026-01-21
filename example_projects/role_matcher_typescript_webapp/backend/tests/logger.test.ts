import logger from '../src/config/logger';
import fs from 'fs';
import path from 'path';

describe('Logger Configuration', () => {
  const logsDir = path.join(__dirname, '../logs');

  it('should create logs directory if it does not exist', () => {
    expect(fs.existsSync(logsDir)).toBe(true);
  });

  it('should have a logger instance', () => {
    expect(logger).toBeDefined();
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('error');
    expect(logger).toHaveProperty('warn');
    expect(logger).toHaveProperty('http');
  });

  it('should log info messages', () => {
    const logSpy = jest.spyOn(logger, 'info');
    logger.info('Test info message');
    expect(logSpy).toHaveBeenCalledWith('Test info message');
    logSpy.mockRestore();
  });

  it('should log error messages', () => {
    const logSpy = jest.spyOn(logger, 'error');
    logger.error('Test error message');
    expect(logSpy).toHaveBeenCalledWith('Test error message');
    logSpy.mockRestore();
  });

  it('should log http messages', () => {
    const logSpy = jest.spyOn(logger, 'http');
    logger.http('Test http message');
    expect(logSpy).toHaveBeenCalledWith('Test http message');
    logSpy.mockRestore();
  });

  it('should log with metadata', () => {
    const logSpy = jest.spyOn(logger, 'info');
    const metadata = { userId: '123', action: 'test' };
    logger.info('Test with metadata', metadata);
    expect(logSpy).toHaveBeenCalledWith('Test with metadata', metadata);
    logSpy.mockRestore();
  });
});
