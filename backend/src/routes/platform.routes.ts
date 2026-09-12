import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';

export const platformRouter = Router();

// Publicly readable status for active users
platformRouter.get('/broadcast/active', adminController.getActiveBroadcast);
platformRouter.get('/surge/status', adminController.getSurgeStatus);
