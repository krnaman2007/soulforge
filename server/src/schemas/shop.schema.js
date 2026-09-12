const { z } = require('zod');

const ItemTypeEnum = z.enum([
  'AVATAR',
  'THEME',
  'SKIN',
  'WEAPON',
  'PET',
  'BACKGROUND',
  'FRAME',
  'TITLE',
  'EFFECT'
]);

const ItemRarityEnum = z.enum([
  'COMMON',
  'UNCOMMON',
  'RARE',
  'EPIC',
  'LEGENDARY'
]);

const listShopQuerySchema = z.object({
  type: ItemTypeEnum.optional(),
  rarity: ItemRarityEnum.optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  search: z.string().trim().max(100).optional()
});

const purchaseItemParamsSchema = z.object({
  itemId: z.string().min(1, 'Item ID or code is required')
});

module.exports = {
  ItemTypeEnum,
  ItemRarityEnum,
  listShopQuerySchema,
  purchaseItemParamsSchema
};
