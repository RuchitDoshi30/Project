import { Router } from 'express';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, togglePin } from '../controllers/announcements.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

router.get('/', authenticate, getAnnouncements);
router.post('/', authenticate, authorize(['admin']), createAnnouncement);
router.put('/:id', authenticate, authorize(['admin']), updateAnnouncement);
router.delete('/:id', authenticate, authorize(['admin']), deleteAnnouncement);
router.patch('/:id/toggle-pin', authenticate, authorize(['admin']), togglePin);

export default router;
