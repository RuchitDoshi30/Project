import { Router } from 'express';
import { getProblems, getProblemBySlug, createProblem, updateProblem, deleteProblem } from '../controllers/problems.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const problemSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  tags: z.array(z.string()).min(1),
  constraints: z.string().optional(),
  testCases: z.array(z.object({
    input: z.string(),
    expectedOutput: z.string(),
    isHidden: z.boolean().optional(),
  })).min(1),
});

router.get('/', authenticate, getProblems);
router.get('/:slug', authenticate, getProblemBySlug);
router.post('/', authenticate, authorize(['admin']), validate(problemSchema), createProblem);
router.put('/:id', authenticate, authorize(['admin']), validate(problemSchema.partial()), updateProblem);
router.delete('/:id', authenticate, authorize(['admin']), deleteProblem);

export default router;
