import { Router } from 'express';
import { getDrives, createDrive, updateDrive, deleteDrive } from '../controllers/drives.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const driveSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').trim(),
  companyLogo: z.string().optional(),
  jobRole: z.string().min(1, 'Job role is required').trim(),
  packageLPA: z.string().min(1, 'Package is required'),
  driveDate: z.string().min(1, 'Drive date is required'),
  lastDateToApply: z.string().min(1, 'Last date to apply is required'),
  location: z.string().min(1, 'Location is required').trim(),
  eligibleBranches: z.array(z.string()).min(1, 'At least one branch required'),
  minCGPA: z.number().min(0).max(10),
  status: z.enum(['Upcoming', 'Ongoing', 'Completed', 'Cancelled']).default('Upcoming'),
  rounds: z.array(z.string()).optional(),
  registeredStudents: z.number().min(0).optional(),
  selectedStudents: z.number().min(0).optional(),
  description: z.string().min(1, 'Description is required'),
});

router.get('/', authenticate, getDrives);
router.post('/', authenticate, authorize(['admin']), validate(driveSchema), createDrive);
router.put('/:id', authenticate, authorize(['admin']), validate(driveSchema.partial()), updateDrive);
router.delete('/:id', authenticate, authorize(['admin']), deleteDrive);

export default router;
