import { Request, Response, NextFunction } from 'express';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema.js';
import * as taskService from '../services/task.service.js';
import { AppError } from '../utils/errors.js';

/**
 * POST /api/tasks
 * Creates a new task for the authenticated user.
 */
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const validated = createTaskSchema.parse(req.body);
    const task = await taskService.createTask(req.user.id, validated);

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tasks
 * Lists tasks for the authenticated user.
 * Optional query param: ?completed=true|false
 */
export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    let completedFilter: boolean | undefined;
    if (req.query.completed === 'true') {
      completedFilter = true;
    } else if (req.query.completed === 'false') {
      completedFilter = false;
    }

    const tasks = await taskService.listTasks(req.user.id, completedFilter);

    res.status(200).json({ tasks });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/tasks/:id
 * Updates a task owned by the authenticated user.
 */
export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const validated = updateTaskSchema.parse(req.body);
    const task = await taskService.updateTask(req.user.id, req.params.id, validated);

    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/tasks/:id
 * Deletes a task owned by the authenticated user.
 */
export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const result = await taskService.deleteTask(req.user.id, req.params.id);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/tasks/:id/complete
 * Completes a task owned by the authenticated user.
 * Phase 2: Establishes completion boundary without RPG rewards.
 */
export async function complete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const result = await taskService.completeTask(req.user.id, req.params.id);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
