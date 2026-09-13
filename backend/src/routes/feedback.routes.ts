import { Router } from 'express';
import * as feedbackController from '../controllers/feedback.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const feedbackRouter = Router();

// All feedback routes require valid authentication
feedbackRouter.post('/', requireAuth, feedbackController.createFeedback);
feedbackRouter.get('/', requireAuth, feedbackController.getFeedback);
