import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

export const adminRouter = Router();

// 1. Users & Economy
adminRouter.get('/users', requireAdmin, adminController.getUsers);
adminRouter.post('/users/:userId/grant', requireAdmin, adminController.grantEconomy);

// 2. Broadcasts
adminRouter.post('/broadcast', requireAdmin, adminController.setBroadcast);
adminRouter.delete('/broadcast', requireAdmin, adminController.dismissBroadcast);

// 3. 2X Surge Engine
adminRouter.post('/surge/start', requireAdmin, adminController.startSurge);
adminRouter.post('/surge/end', requireAdmin, adminController.endSurge);

// 4. Feedback Desk
adminRouter.get('/feedback', requireAdmin, adminController.getAllFeedback);
adminRouter.patch('/feedback/:id', requireAdmin, adminController.replyFeedback);
adminRouter.patch('/feedback/:id/reply', requireAdmin, adminController.replyFeedback);
adminRouter.post('/feedback/:id/reply', requireAdmin, adminController.replyFeedback);
adminRouter.delete('/feedback/:id', requireAdmin, adminController.deleteFeedback);

// 5. Market Studio
adminRouter.get('/market/items', requireAdmin, adminController.getMarketItems);
adminRouter.post('/market/items', requireAdmin, adminController.createMarketItem);
adminRouter.patch('/market/items/:id', requireAdmin, adminController.updateMarketItem);
adminRouter.delete('/market/items/:id', requireAdmin, adminController.deleteMarketItem);
