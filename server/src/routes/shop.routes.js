const { Router } = require('express');
const ShopController = require('../controllers/shop.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');
const { validateQuery, validateParams } = require('../middleware/validation.middleware');
const {
  listShopQuerySchema,
  purchaseItemParamsSchema
} = require('../schemas/shop.schema');

const router = Router();

// GET /api/v1/shop (or /api/shop) - Browsable anonymously, enriched if authenticated
router.get('/', optionalAuthenticate, validateQuery(listShopQuerySchema), ShopController.getShop);

// POST /api/v1/shop/:itemId/purchase - Authenticated purchase
router.post(
  '/:itemId/purchase',
  authenticate,
  validateParams(purchaseItemParamsSchema),
  ShopController.purchase
);

module.exports = router;
