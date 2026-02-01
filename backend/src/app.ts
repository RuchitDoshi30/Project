// backend/src/app.ts
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import testRoutes from './routes/test.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/test', testRoutes);

export default app;
