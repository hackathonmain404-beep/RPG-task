import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service.js';
import { AppError } from '../utils/errors.js';
import { sseHub } from '../utils/sseHub.js';

// --------------------------------------------------
// 1. USERS & ECONOMY
// --------------------------------------------------

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = req.query.q as string | undefined;
    const users = await adminService.listRegisteredUsers(query);
    res.status(200).json({ users, total: users.length });
  } catch (err) {
    next(err);
  }
}

export async function grantEconomy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = req.user?.id;
    if (!adminId) throw new AppError(401, 'UNAUTHORIZED', 'Admin session required.');

    const targetUserId = req.params.userId;
    const result = await adminService.grantUserEconomy(adminId, targetUserId, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// --------------------------------------------------
// 2. BROADCASTS
// --------------------------------------------------

export async function getActiveBroadcast(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const broadcast = await adminService.getActiveBroadcast();
    res.status(200).json({ broadcast });
  } catch (err) {
    next(err);
  }
}

export async function setBroadcast(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const broadcast = await adminService.setBroadcast(req.body);
    res.status(200).json({ broadcast });

    // SSE: Push broadcast to all connected users instantly
    sseHub.broadcast('broadcast:update', { broadcast });
  } catch (err) {
    next(err);
  }
}

export async function dismissBroadcast(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await adminService.dismissBroadcast();
    res.status(200).json(result);

    // SSE: Clear broadcast banner for all connected users
    sseHub.broadcast('broadcast:dismiss', {});
  } catch (err) {
    next(err);
  }
}

// --------------------------------------------------
// 3. 2X SURGE ENGINE
// --------------------------------------------------

export async function getSurgeStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const surge = await adminService.getSurgeStatus();
    res.status(200).json(surge);
  } catch (err) {
    next(err);
  }
}

export async function startSurge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const durationHours = req.body.durationHours || 2;
    const surge = await adminService.startSurgeEvent(durationHours);
    res.status(200).json(surge);

    // SSE: Push surge activation to all users
    sseHub.broadcast('surge:update', { surge });
  } catch (err) {
    next(err);
  }
}

export async function endSurge(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await adminService.endSurgeEvent();
    res.status(200).json(result);

    // SSE: Push surge deactivation to all users
    sseHub.broadcast('surge:update', { surge: { active: false, multiplier: 1.0 } });
  } catch (err) {
    next(err);
  }
}

// --------------------------------------------------
// 4. FEEDBACK DESK
// --------------------------------------------------

export async function getAllFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const typeFilter = req.query.type as string | undefined;
    const feedbacks = await adminService.listAllFeedback(typeFilter);
    res.status(200).json({ feedbacks, total: feedbacks.length });
  } catch (err) {
    next(err);
  }
}

export async function replyFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const feedbackId = req.params.id;
    const { replyText, status } = req.body;
    if (!replyText || !replyText.trim()) {
      throw new AppError(400, 'BAD_REQUEST', 'Reply text cannot be empty.');
    }

    const updated = await adminService.replyFeedback(feedbackId, replyText, status);
    res.status(200).json({ feedback: updated });

    // SSE: Push feedback reply to the specific user who submitted it
    if (updated.userId) {
      sseHub.sendToUser(updated.userId, 'feedback:reply', {
        feedbackId: updated.id,
        adminReply: updated.adminReply,
        status: updated.status,
        repliedAt: updated.repliedAt,
      });
    }
  } catch (err) {
    next(err);
  }
}

export async function deleteFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const feedbackId = req.params.id;
    const result = await adminService.deleteFeedback(feedbackId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// --------------------------------------------------
// 5. MARKET STUDIO
// --------------------------------------------------

export async function getMarketItems(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await adminService.listMarketItems();
    res.status(200).json({ items, total: items.length });
  } catch (err) {
    next(err);
  }
}

export async function createMarketItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description, price, itemType } = req.body;
    if (!name || !description || price === undefined || !itemType) {
      throw new AppError(400, 'BAD_REQUEST', 'Missing required fields: name, description, price, itemType.');
    }

    const item = await adminService.createMarketItem(req.body);
    res.status(201).json({ item });

    // SSE: Push new shop item to all users
    sseHub.broadcast('shop:update', { action: 'created', item });
  } catch (err) {
    next(err);
  }
}

export async function updateMarketItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const itemId = req.params.id;
    const item = await adminService.updateMarketItem(itemId, req.body);
    res.status(200).json({ item });

    // SSE: Push updated shop item to all users
    sseHub.broadcast('shop:update', { action: 'updated', item });
  } catch (err) {
    next(err);
  }
}

export async function deleteMarketItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const itemId = req.params.id;
    const result = await adminService.deleteMarketItem(itemId);
    res.status(200).json(result);

    // SSE: Push item removal to all users
    sseHub.broadcast('shop:update', { action: 'deleted', itemId });
  } catch (err) {
    next(err);
  }
}
