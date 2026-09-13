import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { handleGenerateAvatar } from '../controllers/avatar.controller.js';

const router = Router();

// POST /api/avatars/generate - generate a new AI avatar using Gemini or procedural generator
router.post('/generate', requireAuth, handleGenerateAvatar);

export { router as avatarRouter };
