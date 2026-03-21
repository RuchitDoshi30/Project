import { Router } from 'express';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, togglePin } from '../controllers/announcements.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Body is required'),
  priority: z.enum(['Normal', 'Important', 'Urgent']).default('Normal'),
  targetAudience: z.string().min(1, 'Target audience is required'),
  expiresAt: z.string().min(1, 'Expiry date is required'),
  author: z.string().min(1, 'Author is required'),
});

router.get('/', authenticate, getAnnouncements);
router.post('/', authenticate, authorize(['admin']), validate(announcementSchema), createAnnouncement);
router.put('/:id', authenticate, authorize(['admin']), validate(announcementSchema.partial()), updateAnnouncement);
router.delete('/:id', authenticate, authorize(['admin']), deleteAnnouncement);
router.patch('/:id/toggle-pin', authenticate, authorize(['admin']), togglePin);

export default router;
