import { Request, Response, NextFunction } from 'express';

/**
 * Global error-handling middleware.
 * Must be mounted LAST in the middleware chain.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const requestId = req.requestId || 'unknown';

  // Structured error log
  console.error(JSON.stringify({
    level: 'ERROR',
    timestamp: new Date().toISOString(),
    requestId,
    statusCode,
    message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    userId: (req as any).user?.id || null,
  }));

  res.status(statusCode).json({
    success: false,
    message,
    requestId,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

/**
 * Custom API Error class with status code support.
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
