import { Router } from 'express';
import { getStudentStats, getAdminStats, getStudents, createStudent, updateStudent, deleteStudent, toggleStudentStatus, getRecentActivity, getLeaderboard, getReports, getRecommendations } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const studentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  universityId: z.string().min(1),
  passwordHash: z.string().min(6),
  branch: z.string().optional(),
  semester: z.number().min(1).max(8).optional(),
  enrollmentYear: z.number().optional(),
  accountStatus: z.enum(['active', 'disabled']).optional(),
});

// Student dashboard
router.get('/stats', authenticate, getStudentStats);
router.get('/activity', authenticate, getRecentActivity);
router.get('/leaderboard', authenticate, getLeaderboard);
router.get('/recommendations', authenticate, getRecommendations);

// Admin dashboard
router.get('/admin-stats', authenticate, authorize(['admin']), getAdminStats);
router.get('/reports', authenticate, authorize(['admin']), getReports);

// Admin student management
router.get('/students', authenticate, authorize(['admin']), getStudents);
router.post('/students', authenticate, authorize(['admin']), validate(studentSchema), createStudent);
router.put('/students/:id', authenticate, authorize(['admin']), updateStudent);
router.delete('/students/:id', authenticate, authorize(['admin']), deleteStudent);
router.patch('/students/:id/toggle-status', authenticate, authorize(['admin']), toggleStudentStatus);

export default router;
