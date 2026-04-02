import express from 'express';
import cors from 'cors';

import { generalLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';

import authRoutes from './routes/auth.routes';
import problemsRoutes from './routes/problems.routes';
import submissionsRoutes from './routes/submissions.routes';
import aptitudeRoutes from './routes/aptitude.routes';
import dashboardRoutes from './routes/dashboard.routes';
import announcementsRoutes from './routes/announcements.routes';
import drivesRoutes from './routes/drives.routes';
import bulkEmailRoutes from './routes/bulk-email.routes';

const app = express();

// Trust proxy (required on Render/Heroku for rate limiting + req.ip)
app.set('trust proxy', 1);

// CORS: allow frontend origins (comma-separated in CORS_ORIGIN env var)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Explicit preflight handler — fast 204 before rate limiter
app.options('*', cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(requestLogger);
app.use(generalLimiter);

// Health check (no auth)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API Routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/problems', problemsRoutes);
app.use('/api/v1/submissions', submissionsRoutes);
app.use('/api/v1/aptitude', aptitudeRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/announcements', announcementsRoutes);
app.use('/api/v1/drives', drivesRoutes);
app.use('/api/v1/bulk-emails', bulkEmailRoutes);

// Global error handler — must be LAST
app.use(errorHandler);

export default app;
