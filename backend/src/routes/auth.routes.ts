import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';

export const authRouter = Router();

// Test suite / legacy endpoints
authRouter.post('/register', authRateLimiter, authController.register);
authRouter.post('/login', authRateLimiter, authController.login);

// Supabase-native auth endpoints
authRouter.post('/sync', requireAuth, authController.sync);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, authController.getMe);
authRouter.patch('/profile', requireAuth, authController.updateProfile);
authRouter.delete('/account', requireAuth, authController.deleteAccount);
