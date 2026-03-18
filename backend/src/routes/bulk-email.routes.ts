import { Router } from 'express';
import { sendBulkEmail, getBulkEmails, deleteBulkEmail, getRecipientsCount } from '../controllers/bulk-email.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

router.get('/recipients-count', authenticate, authorize(['admin']), getRecipientsCount);
router.get('/', authenticate, authorize(['admin']), getBulkEmails);
router.post('/', authenticate, authorize(['admin']), sendBulkEmail);
router.delete('/:id', authenticate, authorize(['admin']), deleteBulkEmail);

export default router;
