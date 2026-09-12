const ShopService = require('../services/rpg/shop.service');
const { sendSuccess } = require('../utils/response');

class ShopController {
  static async getShop(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      const data = await ShopService.getShopItems(userId, req.query);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  static async purchase(req, res, next) {
    try {
      const { itemId } = req.params;
      const result = await ShopService.purchaseItem(req.user.id, itemId);
      return sendSuccess(res, result, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ShopController;
