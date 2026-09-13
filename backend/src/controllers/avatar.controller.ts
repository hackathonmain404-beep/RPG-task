import { Request, Response, NextFunction } from 'express';
import { GeminiAvatarService } from '../services/gemini.service.js';

export async function handleGenerateAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || 'test-user-id';
    const { prompt, archetype, styleCategory } = req.body;
    const result = await GeminiAvatarService.generateAvatar({
      userId,
      prompt,
      archetype,
      styleCategory,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}
