import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

// Helper to get IP address from request
function getClientIp(req: Request): string {
  // Check for X-Forwarded-For header (used by proxies/load balancers)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
    return ips[0].trim();
  }

  // Check for X-Real-IP header
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    return realIp;
  }

  // Fall back to socket remote address
  return req.socket.remoteAddress || 'unknown';
}

// Helper to extract user ID from request (if available)
function getUserId(req: Request): string | undefined {
  // Check for user ID in headers (common in auth systems)
  const userId = req.headers['x-user-id'] || req.headers['user-id'];
  if (userId && typeof userId === 'string') {
    return userId;
  }

  // Check for user in request object (if set by auth middleware)
  if ((req as any).user?.id) {
    return (req as any).user.id;
  }

  return undefined;
}

// Helper to calculate content length
function getContentLength(data: any): number {
  if (!data) return 0;
  if (typeof data === 'string') return Buffer.byteLength(data);
  if (Buffer.isBuffer(data)) return data.length;
  return Buffer.byteLength(JSON.stringify(data));
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Capture request details
  const requestInfo = {
    requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    ip: getClientIp(req),
    userId: getUserId(req),
    userAgent: req.headers['user-agent'],
    contentType: req.headers['content-type'],
    requestSize: getContentLength(req.body)
  };

  // Log incoming request
  logger.http('Incoming request', requestInfo);

  // Store original methods
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  let responseBody: any;
  let responseSent = false;

  // Wrapper for res.json()
  res.json = function(body: any): Response {
    if (!responseSent) {
      responseBody = body;
      responseSent = true;
      logResponse();
    }
    return originalJson(body);
  };

  // Wrapper for res.send()
  res.send = function(body?: any): Response {
    if (!responseSent) {
      responseBody = body;
      responseSent = true;
      logResponse();
    }
    return originalSend(body);
  };

  // Function to log the response
  function logResponse() {
    const duration = Date.now() - startTime;
    const responseInfo = {
      requestId,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      durationMs: duration,
      ip: requestInfo.ip,
      userId: requestInfo.userId,
      responseSize: getContentLength(responseBody),
      contentType: res.getHeader('content-type')
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error('Request failed with server error', {
        ...responseInfo,
        error: responseBody?.error || responseBody?.message
      });
    } else if (res.statusCode >= 400) {
      logger.warn('Request failed with client error', {
        ...responseInfo,
        error: responseBody?.error || responseBody?.message
      });
    } else {
      logger.http('Request completed successfully', responseInfo);
    }
  }

  // Handle response finish event as fallback
  res.on('finish', () => {
    if (!responseSent) {
      responseSent = true;
      logResponse();
    }
  });

  // Continue to next middleware
  next();
}
