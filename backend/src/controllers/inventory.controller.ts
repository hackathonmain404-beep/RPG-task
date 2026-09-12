import { Request, Response, NextFunction } from 'express';
import { getUserInventory, equipItem } from '../services/inventory.service.js';

export async function handleGetInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const items = await getUserInventory(userId);
    res.json({ items, inventory: items });
  } catch (error) {
    next(error);
  }
}

export async function handleEquipItem(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const result = await equipItem(userId, itemId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
