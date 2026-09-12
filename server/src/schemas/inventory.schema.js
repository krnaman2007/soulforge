const { z } = require('zod');
const { ItemTypeEnum } = require('./shop.schema');

const listInventoryQuerySchema = z.object({
  type: ItemTypeEnum.optional(),
  equipped: z.preprocess(
    (val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    },
    z.boolean().optional()
  )
});

const equipItemParamsSchema = z.object({
  itemId: z.string().min(1, 'Item ID or Inventory ID is required')
});

module.exports = {
  listInventoryQuerySchema,
  equipItemParamsSchema
};
