// backend/src/routes/test.routes.ts
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

router.get(
  '/admin-only',
  authenticate,
  authorize(['admin']),
  (_req, res) => {
    res.json({ message: 'Admin access granted' });
  },
);

export default router;
