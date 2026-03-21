import { Router } from 'express';
import { sendBulkEmail, getBulkEmails, deleteBulkEmail, getRecipientsCount } from '../controllers/bulk-email.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const bulkEmailSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(500),
  body: z.string().min(1, 'Email body is required'),
  filters: z.object({
    branches: z.array(z.string()).optional(),
    batch: z.string().optional(),
    minCgpa: z.number().min(0).max(10).optional(),
  }).optional(),
});

router.get('/', authenticate, authorize(['admin']), getBulkEmails);
router.get('/recipients-count', authenticate, authorize(['admin']), getRecipientsCount);
router.post('/', authenticate, authorize(['admin']), validate(bulkEmailSchema), sendBulkEmail);
router.delete('/:id', authenticate, authorize(['admin']), deleteBulkEmail);

export default router;
