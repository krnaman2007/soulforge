const prisma = require('../../db/prisma');
const { AppError } = require('../../utils/errors');

class ShopService {
  /**
   * Retrieves cosmetic shop catalog with optional filters and contextual user ownership metadata.
   */
  static async getShopItems(userId = null, query = {}) {
    const where = {};

    if (query.type) {
      where.type = query.type;
    }

    if (query.rarity) {
      where.rarity = query.rarity;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const items = await prisma.item.findMany({
      where,
      orderBy: [
        { price: 'asc' },
        { rarity: 'asc' }
      ]
    });

    let userCoins = null;
    const ownedMap = new Map();

    if (userId) {
      const [character, userInventory] = await Promise.all([
        prisma.character.findUnique({
          where: { userId },
          select: { coins: true }
        }),
        prisma.inventory.findMany({
          where: { userId },
          select: { itemId: true, equipped: true }
        })
      ]);

      userCoins = character ? character.coins : 0;
      for (const inv of userInventory) {
        ownedMap.set(inv.itemId, inv);
      }
    }

    const decoratedItems = items.map((item) => {
      const ownedRecord = ownedMap.get(item.id);
      const isOwned = !!ownedRecord;
      const isEquipped = ownedRecord ? ownedRecord.equipped : false;
      const canAfford = userCoins !== null ? userCoins >= item.price : false;

      return {
        id: item.id,
        code: item.code,
        name: item.name,
        description: item.description,
        type: item.type,
        rarity: item.rarity,
        price: item.price,
        metadata: item.metadata,
        isOwned,
        isEquipped,
        canAfford: isOwned ? false : canAfford,
        createdAt: item.createdAt
      };
    });

    return {
      coins: userCoins,
      items: decoratedItems,
      total: decoratedItems.length
    };
  }

  /**
   * Purchases a cosmetic item authoritatively using player coins in an ACID transaction.
   */
  static async purchaseItem(userId, itemIdentifier) {
    if (!itemIdentifier) {
      throw new AppError('VALIDATION_ERROR', 'Item ID or code must be specified', 400);
    }

    // 1. Resolve item from catalog
    const item = await prisma.item.findFirst({
      where: {
        OR: [
          { id: itemIdentifier },
          { code: itemIdentifier }
        ]
      }
    });

    if (!item) {
      throw new AppError('ITEM_NOT_FOUND', 'Item not found in shop catalog', 404);
    }

    // 2. Check if player already owns this item
    const existingOwnership = await prisma.inventory.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId: item.id
        }
      }
    });

    if (existingOwnership) {
      throw new AppError(
        'ALREADY_OWNED',
        `You already own ${item.name} in your inventory`,
        409,
        { itemId: item.id, itemCode: item.code }
      );
    }

    // 3. Execute atomic transaction: verify coins, decrement balance, create inventory, log activity
    const result = await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({
        where: { userId }
      });

      if (!character) {
        throw new AppError('CHARACTER_NOT_FOUND', 'Player character record not found', 404);
      }

      if (character.coins < item.price) {
        throw new AppError(
          'INSUFFICIENT_COINS',
          `Insufficient coins. Required: ${item.price}, Available: ${character.coins}`,
          400,
          { required: item.price, currentCoins: character.coins }
        );
      }

      // Deduct coins
      const updatedCharacter = await tx.character.update({
        where: { userId },
        data: {
          coins: { decrement: item.price }
        }
      });

      // Add to player inventory
      const inventory = await tx.inventory.create({
        data: {
          userId,
          itemId: item.id,
          equipped: false
        }
      });

      // Record ActivityLog entry for player history timeline
      await tx.activityLog.create({
        data: {
          userId,
          type: 'ITEM_PURCHASED',
          itemId: item.id,
          coinChange: -item.price,
          xpChange: 0,
          metadata: {
            itemName: item.name,
            itemCode: item.code,
            itemType: item.type,
            rarity: item.rarity,
            price: item.price
          }
        }
      });

      return {
        inventory,
        item,
        character: {
          coins: updatedCharacter.coins
        }
      };
    });

    return {
      message: `Successfully purchased ${result.item.name}!`,
      item: {
        id: result.item.id,
        code: result.item.code,
        name: result.item.name,
        type: result.item.type,
        rarity: result.item.rarity,
        price: result.item.price,
        metadata: result.item.metadata
      },
      inventoryId: result.inventory.id,
      remainingCoins: result.character.coins
    };
  }
}

module.exports = ShopService;
