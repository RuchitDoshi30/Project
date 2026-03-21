import { Router } from 'express';
import { getDrives, createDrive, updateDrive, deleteDrive } from '../controllers/drives.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const driveSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  description: z.string().min(1, 'Description is required'),
  eligibilityCriteria: z.string().optional(),
  packageLPA: z.number().min(0).optional(),
  driveDate: z.string().min(1, 'Drive date is required'),
  registrationDeadline: z.string().min(1, 'Registration deadline is required'),
  status: z.enum(['Upcoming', 'Ongoing', 'Completed', 'Cancelled']).default('Upcoming'),
});

router.get('/', authenticate, getDrives);
router.post('/', authenticate, authorize(['admin']), validate(driveSchema), createDrive);
router.put('/:id', authenticate, authorize(['admin']), validate(driveSchema.partial()), updateDrive);
router.delete('/:id', authenticate, authorize(['admin']), deleteDrive);

export default router;
