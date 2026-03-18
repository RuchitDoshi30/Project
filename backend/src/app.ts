import express from 'express';
import cors from 'cors';

import { generalLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';

import authRoutes from './routes/auth.routes';
import problemsRoutes from './routes/problems.routes';
import submissionsRoutes from './routes/submissions.routes';
import aptitudeRoutes from './routes/aptitude.routes';
import dashboardRoutes from './routes/dashboard.routes';
import announcementsRoutes from './routes/announcements.routes';
import drivesRoutes from './routes/drives.routes';
import bulkEmailRoutes from './routes/bulk-email.routes';

const app = express();

// CORS: allow frontend origin
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(generalLimiter);

// Health check (no auth)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/drives', drivesRoutes);
app.use('/api/bulk-emails', bulkEmailRoutes);

// Global error handler — must be LAST
app.use(errorHandler);

export default app;
