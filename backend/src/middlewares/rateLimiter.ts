import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/** Extract user ID from request for per-user rate limiting (falls back to IP) */
const getUserKey = (req: Request): string => {
  return (req as any).user?.id || req.ip || 'unknown';
};

/** General rate limiter: 1000 requests per 15 minutes per IP */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

/** Per-user general limiter: 200 requests per 15 minutes per user */
export const perUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  keyGenerator: getUserKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

/** Auth rate limiter: 10 login attempts per 15 minutes per IP */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' },
});

/** Per-user submission limiter: 10 submissions per 15 minutes per user */
export const userSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: getUserKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Submission rate limit exceeded. Maximum 10 submissions per 15 minutes.' },
});

/** Per-user aptitude attempt limiter: 5 attempts per 15 minutes per user */
export const userAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: getUserKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Attempt rate limit exceeded. Maximum 5 attempts per 15 minutes.' },
});
