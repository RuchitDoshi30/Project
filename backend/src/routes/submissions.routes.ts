import { Router } from 'express';
import { createSubmission, getMySubmissions, getMySubmissionsForProblem, getAllSubmissions, approveSubmission, rejectSubmission } from '../controllers/submissions.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { submissionLimiter } from '../middlewares/rateLimiter';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const submissionSchema = z.object({
  problemId: z.string().min(1),
  code: z.string().min(1),
  language: z.string().min(1),
});

// Student routes (uses req.user.id)
router.post('/', authenticate, submissionLimiter, validate(submissionSchema), createSubmission);
router.get('/me', authenticate, getMySubmissions);
router.get('/me/problem/:problemId', authenticate, getMySubmissionsForProblem);

// Admin routes
router.get('/admin', authenticate, authorize(['admin']), getAllSubmissions);
router.patch('/:id/approve', authenticate, authorize(['admin']), approveSubmission);
router.patch('/:id/reject', authenticate, authorize(['admin']), rejectSubmission);

export default router;
