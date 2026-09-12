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
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Atomic conditional decrement: guarantees row-level lock and prevents concurrency overdrafts
        const updateResult = await tx.character.updateMany({
          where: {
            userId,
            coins: { gte: item.price }
          },
          data: {
            coins: { decrement: item.price }
          }
        });

        if (updateResult.count === 0) {
          const currentChar = await tx.character.findUnique({
            where: { userId },
            select: { coins: true }
          });
          const availableCoins = currentChar ? currentChar.coins : 0;
          throw new AppError(
            'INSUFFICIENT_COINS',
            `Insufficient coins. Required: ${item.price}, Available: ${availableCoins}`,
            400,
            { required: item.price, currentCoins: availableCoins }
          );
        }

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

        // Fetch authoritative character coins after atomic deduction
        const updatedCharacter = await tx.character.findUnique({
          where: { userId },
          select: { coins: true }
        });

        return {
          inventory,
          item,
          character: {
            coins: updatedCharacter ? updatedCharacter.coins : 0
          }
        };
      }, { timeout: 25000, maxWait: 20000 });

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
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError(
          'ALREADY_OWNED',
          `You already own ${item.name} in your inventory`,
          409,
          { itemId: item.id, itemCode: item.code }
        );
      }
      throw error;
    }
  }
}

module.exports = ShopService;
