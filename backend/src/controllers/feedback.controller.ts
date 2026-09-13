import { Request, Response, NextFunction } from 'express';
import { createFeedbackSchema } from '../schemas/feedback.schema.js';
import * as feedbackService from '../services/feedback.service.js';
import { AppError } from '../utils/errors.js';

/**
 * POST /api/feedback
 * Accepts user feedback and stores in database.
 */
export async function createFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required to submit feedback.');
    }

    const input = createFeedbackSchema.parse(req.body);
    const feedback = await feedbackService.submitFeedback(req.user.id, input);

    res.status(201).json({
      feedback: {
        id: feedback.id,
        userId: feedback.userId,
        type: feedback.type,
        message: feedback.message,
        status: feedback.status,
        createdAt: feedback.createdAt.toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/feedback
 * Returns feedback history for the authenticated user.
 */
export async function getFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const list = await feedbackService.listUserFeedback(req.user.id);

    res.status(200).json({
      feedbacks: list.map((f: any) => ({
        id: f.id,
        userId: f.userId,
        type: f.type,
        message: f.message,
        status: f.status,
        adminReply: f.adminReply || null,
        repliedAt: f.repliedAt ? (f.repliedAt instanceof Date ? f.repliedAt.toISOString() : f.repliedAt) : null,
        createdAt: f.createdAt instanceof Date ? f.createdAt.toISOString() : f.createdAt,
        updatedAt: f.updatedAt instanceof Date ? f.updatedAt.toISOString() : f.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}
