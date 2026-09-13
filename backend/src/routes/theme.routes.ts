import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { handleGetThemes } from '../controllers/badge.controller.js';

const router = Router();

// GET /api/themes — returns available visual themes and user ownership (requires auth)
router.get('/', requireAuth, handleGetThemes);

export { router as themeRouter };
