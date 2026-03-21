import { Router } from 'express';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion, getTests, getTestById, createTest, submitAttempt, getMyAttempts, getAttemptById } from '../controllers/aptitude.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { userAttemptLimiter } from '../middlewares/rateLimiter';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const questionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).length(4),
  correctOptionIndex: z.number().min(0).max(3),
  category: z.enum(['Quantitative', 'Logical', 'Verbal', 'Technical']),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  explanation: z.string().optional(),
});

const testSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['Quantitative', 'Logical', 'Verbal', 'Technical']),
  questions: z.array(z.string()).min(1),
  duration: z.number().min(1),
  passingPercentage: z.number().min(0).max(100),
});

const attemptSchema = z.object({
  testId: z.string().min(1),
  answers: z.array(z.object({
    questionId: z.string().min(1),
    selectedOption: z.number().min(0).max(3),
  })),
});

// Questions (admin only)
router.get('/questions', authenticate, authorize(['admin']), getQuestions);
router.post('/questions', authenticate, authorize(['admin']), validate(questionSchema), createQuestion);
router.put('/questions/:id', authenticate, authorize(['admin']), validate(questionSchema), updateQuestion);
router.delete('/questions/:id', authenticate, authorize(['admin']), deleteQuestion);

// Tests
router.get('/tests', authenticate, getTests);
router.get('/tests/:id', authenticate, getTestById);
router.post('/tests', authenticate, authorize(['admin']), validate(testSchema), createTest);

// Attempts
router.post('/attempts', authenticate, userAttemptLimiter, validate(attemptSchema), submitAttempt);
router.get('/attempts/me', authenticate, getMyAttempts);
router.get('/attempts/:id', authenticate, getAttemptById);

export default router;
