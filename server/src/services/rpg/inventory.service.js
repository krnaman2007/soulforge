const prisma = require('../../db/prisma');
const { AppError } = require('../../utils/errors');

const COSMETIC_SLOT_MAP = {
  AVATAR: 'avatarId',
  THEME: 'themeId',
  SKIN: 'skinId',
  FRAME: 'frameId',
  TITLE: 'titleId',
  WEAPON: 'weaponId',
  PET: 'petId',
  BACKGROUND: 'backgroundId',
  EFFECT: 'effectId'
};

class InventoryService {
  /**
   * Retrieves player's inventory with item metadata and currently equipped loadout summary.
   */
  static async getUserInventory(userId, query = {}) {
    const where = { userId };

    if (query.type) {
      where.item = { type: query.type };
    }

    if (query.equipped !== undefined) {
      where.equipped = query.equipped;
    }

    const [inventoryRecords, character] = await Promise.all([
      prisma.inventory.findMany({
        where,
        include: {
          item: true
        },
        orderBy: [
          { equipped: 'desc' },
          { purchasedAt: 'desc' }
        ]
      }),
      prisma.character.findUnique({
        where: { userId },
        select: {
          coins: true,
          avatarId: true,
          themeId: true,
          skinId: true,
          frameId: true,
          titleId: true,
          weaponId: true,
          petId: true,
          backgroundId: true,
          effectId: true
        }
      })
    ]);

    const loadout = {
      avatar: character?.avatarId || 'avatar_starter',
      theme: character?.themeId || 'theme_classic',
      skin: character?.skinId || null,
      frame: character?.frameId || null,
      title: character?.titleId || 'title_apprentice',
      weapon: character?.weaponId || null,
      pet: character?.petId || null,
      background: character?.backgroundId || null,
      effect: character?.effectId || null
    };

    const items = inventoryRecords.map((inv) => ({
      inventoryId: inv.id,
      itemId: inv.item.id,
      code: inv.item.code,
      name: inv.item.name,
      description: inv.item.description,
      type: inv.item.type,
      rarity: inv.item.rarity,
      equipped: inv.equipped,
      metadata: inv.item.metadata,
      purchasedAt: inv.purchasedAt
    }));

    return {
      loadout,
      coins: character?.coins || 0,
      items,
      total: items.length
    };
  }

  /**
   * Equips a cosmetic item owned by the player, ensuring category slot exclusivity.
   */
  static async equipItem(userId, itemIdentifier) {
    if (!itemIdentifier) {
      throw new AppError('VALIDATION_ERROR', 'Item identifier is required', 400);
    }

    // 1. Resolve inventory entry (accepts either itemId, item.code, or inventoryId)
    const invRecord = await prisma.inventory.findFirst({
      where: {
        userId,
        OR: [
          { itemId: itemIdentifier },
          { id: itemIdentifier },
          { item: { code: itemIdentifier } }
        ]
      },
      include: {
        item: true
      }
    });

    if (!invRecord) {
      throw new AppError(
        'ITEM_NOT_IN_INVENTORY',
        'You do not own this item. Purchase it in the shop first.',
        404
      );
    }

    const { item } = invRecord;
    const slotField = COSMETIC_SLOT_MAP[item.type];

    if (!slotField) {
      throw new AppError('INVALID_SLOT', `Item type ${item.type} cannot be equipped`, 400);
    }

    // If already equipped, return cleanly
    if (invRecord.equipped) {
      return {
        message: `${item.name} is already equipped`,
        item: {
          id: item.id,
          code: item.code,
          name: item.name,
          type: item.type,
          slot: slotField
        },
        equipped: true
      };
    }

    // 2. Perform atomic slot switch
    const updatedCharacter = await prisma.$transaction(async (tx) => {
      // Unequip any existing item of the same category owned by this user
      await tx.inventory.updateMany({
        where: {
          userId,
          item: { type: item.type },
          equipped: true
        },
        data: {
          equipped: false
        }
      });

      // Equip target item in inventory
      await tx.inventory.update({
        where: { id: invRecord.id },
        data: { equipped: true }
      });

      // Update cosmetic slot on Character
      const updateData = {};
      updateData[slotField] = item.code || item.id;

      const char = await tx.character.update({
        where: { userId },
        data: updateData
      });

      // Log ITEM_EQUIPPED activity
      await tx.activityLog.create({
        data: {
          userId,
          type: 'ITEM_EQUIPPED',
          itemId: item.id,
          coinChange: 0,
          xpChange: 0,
          metadata: {
            itemName: item.name,
            itemCode: item.code,
            itemType: item.type,
            rarity: item.rarity,
            slot: slotField
          }
        }
      });

      return char;
    });

    return {
      message: `Successfully equipped ${item.name}!`,
      item: {
        id: item.id,
        code: item.code,
        name: item.name,
        type: item.type,
        rarity: item.rarity,
        slot: slotField
      },
      equipped: true,
      loadout: {
        avatar: updatedCharacter.avatarId,
        theme: updatedCharacter.themeId,
        skin: updatedCharacter.skinId,
        frame: updatedCharacter.frameId,
        title: updatedCharacter.titleId,
        weapon: updatedCharacter.weaponId,
        pet: updatedCharacter.petId,
        background: updatedCharacter.backgroundId,
        effect: updatedCharacter.effectId
      }
    };
  }
}

module.exports = InventoryService;
