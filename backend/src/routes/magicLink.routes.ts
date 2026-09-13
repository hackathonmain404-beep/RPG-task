import { Router } from 'express';
import * as magicLinkController from '../controllers/magicLink.controller.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';

export const magicLinkRouter = Router();

magicLinkRouter.post('/send', authRateLimiter, magicLinkController.send);
magicLinkRouter.post('/', authRateLimiter, magicLinkController.send);
magicLinkRouter.get('/verify', magicLinkController.verify);
magicLinkRouter.post('/verify', magicLinkController.verify);
