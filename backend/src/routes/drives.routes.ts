import { Router } from 'express';
import { getDrives, createDrive, updateDrive, deleteDrive } from '../controllers/drives.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

router.get('/', authenticate, getDrives);
router.post('/', authenticate, authorize(['admin']), createDrive);
router.put('/:id', authenticate, authorize(['admin']), updateDrive);
router.delete('/:id', authenticate, authorize(['admin']), deleteDrive);

export default router;
