const InventoryService = require('../services/rpg/inventory.service');
const { sendSuccess } = require('../utils/response');

class InventoryController {
  static async getInventory(req, res, next) {
    try {
      const data = await InventoryService.getUserInventory(req.user.id, req.query);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  static async equip(req, res, next) {
    try {
      const { itemId } = req.params;
      const result = await InventoryService.equipItem(req.user.id, itemId);
      return sendSuccess(res, result, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InventoryController;
