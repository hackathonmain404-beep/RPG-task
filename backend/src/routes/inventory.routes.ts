import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { handleGetInventory, handleEquipItem } from '../controllers/inventory.controller.js';

const router = Router();

// GET /api/inventory — user's owned items (requires auth)
router.get('/', requireAuth, handleGetInventory);

// POST /api/inventory/:itemId/equip — equip owned item (requires auth)
router.post('/:itemId/equip', requireAuth, handleEquipItem);

export { router as inventoryRouter };
