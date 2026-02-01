// backend/src/middlewares/role.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/auth';

export const authorize =
  (roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
