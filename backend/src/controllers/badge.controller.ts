import { Request, Response, NextFunction } from 'express';
import { getBadgeCatalog, getThemeCatalog } from '../services/badge.service.js';

export async function handleGetBadges(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const badges = await getBadgeCatalog(userId);
    res.json({ badges });
  } catch (error) {
    next(error);
  }
}

export async function handleGetThemes(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const themes = await getThemeCatalog(userId);
    res.json({ themes });
  } catch (error) {
    next(error);
  }
}
