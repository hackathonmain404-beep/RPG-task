import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import * as chatController from '../controllers/chat.controller.js';

export const chatRouter = Router();

/**
 * GET /api/chat/messages
 * Fetch recent community chat messages (last 3 days).
 * Authentication required to read messages.
 */
chatRouter.get('/messages', requireAuth, chatController.getChatMessages);

/**
 * POST /api/chat/messages
 * Send a new community chat message.
 * Authentication required.
 */
chatRouter.post('/messages', requireAuth, chatController.sendChatMessage);
