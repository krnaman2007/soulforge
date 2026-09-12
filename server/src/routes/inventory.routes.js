const { Router } = require('express');
const InventoryController = require('../controllers/inventory.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateQuery, validateParams } = require('../middleware/validation.middleware');
const {
  listInventoryQuerySchema,
  equipItemParamsSchema
} = require('../schemas/inventory.schema');

const router = Router();

// All inventory routes require authentication
router.use(authenticate);

// GET /api/v1/inventory (or /api/inventory)
router.get('/', validateQuery(listInventoryQuerySchema), InventoryController.getInventory);

// POST /api/v1/inventory/:itemId/equip (or /api/inventory/:itemId/equip)
router.post(
  '/:itemId/equip',
  validateParams(equipItemParamsSchema),
  InventoryController.equip
);

module.exports = router;
