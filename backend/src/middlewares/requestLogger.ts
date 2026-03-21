import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Extend Express Request to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Structured request logging middleware.
 * 
 * Outputs JSON logs compatible with ELK / CloudWatch / Datadog.
 * Attaches a unique requestId (UUID) to every request for tracing.
 * Includes userId when authenticated.
 * Audit-logs admin mutation actions.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Generate unique request ID for tracing
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);

  // Capture original end to log after response
  const originalEnd = res.end.bind(res);
  const wrappedEnd = (...args: Parameters<typeof res.end>) => {
    const duration = Date.now() - start;

    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: (req as any).user?.id || null,
      userAgent: req.get('User-Agent')?.substring(0, 100) || null,
      ip: req.ip,
    };

    if (res.statusCode >= 400) {
      console.error(JSON.stringify({ level: 'ERROR', ...logEntry }));
    } else {
      console.log(JSON.stringify({ level: 'INFO', ...logEntry }));
    }

    // Audit log admin mutation actions
    if (
      (req as any).user?.role === 'admin' &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
    ) {
      console.log(JSON.stringify({
        level: 'AUDIT',
        timestamp: logEntry.timestamp,
        requestId: req.requestId,
        admin: (req as any).user?.email,
        action: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: logEntry.duration,
      }));
    }

    return originalEnd(...args);
  };
  res.end = wrappedEnd as typeof res.end;

  next();
};
