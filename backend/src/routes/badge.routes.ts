import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { handleGetBadges, handleGetThemes } from '../controllers/badge.controller.js';

const router = Router();

// GET /api/badges — badge catalog with user unlock states (requires auth)
router.get('/', requireAuth, handleGetBadges);

// GET /api/themes — theme catalog with ownership (requires auth)
router.get('/themes', requireAuth, handleGetThemes);

export { router as badgeRouter };
