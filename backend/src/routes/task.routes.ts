import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const taskRouter = Router();

// All task routes require authentication
taskRouter.post('/', requireAuth, taskController.create);
taskRouter.get('/', requireAuth, taskController.list);
taskRouter.patch('/:id', requireAuth, taskController.update);
taskRouter.delete('/:id', requireAuth, taskController.remove);
taskRouter.post('/:id/complete', requireAuth, taskController.complete);
