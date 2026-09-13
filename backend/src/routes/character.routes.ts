import { Router } from 'express';
import * as characterController from '../controllers/character.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const characterRouter = Router();

characterRouter.get('/', requireAuth, characterController.getCharacter);
characterRouter.get('/history', requireAuth, characterController.getHistory);
