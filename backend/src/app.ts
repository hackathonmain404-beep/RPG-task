import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { taskRouter } from './routes/task.routes.js';
import { shopRouter } from './routes/shop.routes.js';
import { inventoryRouter } from './routes/inventory.routes.js';
import { badgeRouter } from './routes/badge.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

export const app = express();

const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/health', healthRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/shop', shopRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/badges', badgeRouter);

// 404 Route Handler
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested API route does not exist.',
      details: null,
    },
  });
});

// Error handling middleware
app.use(errorHandler);
