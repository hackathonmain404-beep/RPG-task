import { Request, Response, NextFunction } from 'express';
import { getShopCatalog, purchaseItem } from '../services/shop.service.js';

export async function handleGetShopCatalog(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await getShopCatalog();
    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function handlePurchaseItem(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const result = await purchaseItem(userId, itemId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
