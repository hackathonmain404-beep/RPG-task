import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { handleGetShopCatalog, handlePurchaseItem } from '../controllers/shop.controller.js';

const router = Router();

// GET /api/shop — active shop catalog (requires auth)
router.get('/', requireAuth, handleGetShopCatalog);

// POST /api/shop/:itemId/purchase — atomic purchase (requires auth)
router.post('/:itemId/purchase', requireAuth, handlePurchaseItem);

export { router as shopRouter };
