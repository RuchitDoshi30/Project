import { Router } from 'express';
import { login, getMe, updateProfile, updatePassword, downloadMyData, deleteAccount } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimiter';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  notifications: z.object({
    emailOnSubmission: z.boolean().optional(),
    emailOnTestComplete: z.boolean().optional(),
    emailWeeklySummary: z.boolean().optional(),
    inAppNotifications: z.boolean().optional(),
  }).optional(),
  privacy: z.object({
    profileVisible: z.boolean().optional(),
    showInLeaderboard: z.boolean().optional(),
  }).optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.put('/password', authenticate, validate(updatePasswordSchema), updatePassword);
router.get('/download-data', authenticate, downloadMyData);
router.delete('/account', authenticate, deleteAccount);

export default router;

