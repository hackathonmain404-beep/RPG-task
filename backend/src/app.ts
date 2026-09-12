import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { taskRouter } from './routes/task.routes.js';
import { shopRouter } from './routes/shop.routes.js';
import { inventoryRouter } from './routes/inventory.routes.js';
import { badgeRouter } from './routes/badge.routes.js';
import { themeRouter } from './routes/theme.routes.js';
import { characterRouter } from './routes/character.routes.js';
import { feedbackRouter } from './routes/feedback.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { magicLinkRouter } from './routes/magicLink.routes.js';
import { platformRouter } from './routes/platform.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

export const app = express();

// Security Headers via Helmet (HSTS, X-Content-Type-Options: nosniff, Frameguard: deny)
app.use(helmet());

// CORS configuration supporting localhost, Vercel deployments, and explicit origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, serverless same-origin, curl)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for production deployment
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Router setup: mount under both /api and root / for Vercel rewrite resilience
const apiRouter = express.Router();
apiRouter.use('/auth/magic-link', magicLinkRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/health', healthRouter);
apiRouter.use('/tasks', taskRouter);
apiRouter.use('/shop', shopRouter);
apiRouter.use('/inventory', inventoryRouter);
apiRouter.use('/badges', badgeRouter);
apiRouter.use('/themes', themeRouter);
apiRouter.use('/character', characterRouter);
apiRouter.use('/feedback', feedbackRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/platform', platformRouter);
apiRouter.use('/broadcast', platformRouter);
apiRouter.use('/surge', platformRouter);

// Mount router under both prefixes
app.use('/api', apiRouter);
app.use('/', apiRouter);

// 404 Route Handler for unmatched API routes
app.use((_req: Request, res: Response) => {
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
