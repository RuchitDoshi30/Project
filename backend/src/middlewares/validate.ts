import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Generic Zod validation middleware.
 * Validates req.body against the provided schema.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((e) => `${String(e.path.join('.'))}: ${e.message}`);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: messages,
        });
      }
      next(error);
    }
  };
};

/**
 * Validates req.query against the provided schema.
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query);
      Object.assign(req.query, parsed);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((e) => `${String(e.path.join('.'))}: ${e.message}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: messages,
        });
      }
      next(error);
    }
  };
};
