import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';
import { sseHub } from '../utils/sseHub.js';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const MAX_MESSAGE_LENGTH = 500;

/**
 * GET /api/chat/messages
 * 
 * Fetch community chat messages from the last 3 days.
 * Returns messages in chronological order with user info and character level.
 */
export async function getChatMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const threeDaysAgo = new Date(Date.now() - THREE_DAYS_MS);
    const limit = Math.min(200, Math.max(1, parseInt((req.query.limit as string) || '100', 10)));

    const messages = await prisma.communityChatMessage.findMany({
      where: {
        createdAt: { gte: threeDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        userId: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            character: {
              select: {
                level: true,
              },
            },
          },
        },
      },
    });

    // Flatten user.character for the frontend
    const formatted = messages.map((msg) => ({
      id: msg.id,
      userId: msg.userId,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
      user: {
        id: msg.user.id,
        displayName: msg.user.displayName,
        avatarUrl: msg.user.avatarUrl,
        role: msg.user.role,
        level: msg.user.character?.level ?? 1,
      },
    }));

    res.json({
      messages: formatted,
      count: formatted.length,
      retentionDays: 3,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/messages
 * 
 * Send a new community chat message. Requires authentication.
 * Broadcasts the message to all SSE-connected clients in real time.
 */
export async function sendChatMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'You must be logged in to send messages.');
    }

    const { content } = req.body;
    if (!content || typeof content !== 'string') {
      throw new AppError(400, 'VALIDATION_ERROR', 'Message content is required.');
    }

    const trimmed = content.trim();
    if (trimmed.length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Message cannot be empty.');
    }

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      throw new AppError(400, 'VALIDATION_ERROR', `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`);
    }

    // Create the message in the database
    const message = await prisma.communityChatMessage.create({
      data: {
        userId,
        content: trimmed,
      },
      select: {
        id: true,
        userId: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            character: {
              select: {
                level: true,
              },
            },
          },
        },
      },
    });

    const formatted = {
      id: message.id,
      userId: message.userId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      user: {
        id: message.user.id,
        displayName: message.user.displayName,
        avatarUrl: message.user.avatarUrl,
        role: message.user.role,
        level: message.user.character?.level ?? 1,
      },
    };

    // Broadcast to all connected SSE clients for live updates
    sseHub.broadcast('chat:message', formatted);

    res.status(201).json(formatted);
  } catch (err) {
    next(err);
  }
}
