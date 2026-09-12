const prisma = require('../db/prisma');
const { AppError } = require('../utils/errors');

function generateCouponCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SOUL-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += '-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function getAllRewards(filters = {}) {
  const where = { isActive: true };
  if (filters.category) {
    where.category = filters.category;
  }
  if (filters.rarity) {
    where.rarity = filters.rarity;
  }

  const rewards = await prisma.reward.findMany({
    where,
    orderBy: { xpCost: 'asc' },
  });

  return rewards;
}

async function redeemReward(userId, rewardId) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch User Character (for XP)
    const character = await tx.character.findUnique({
      where: { userId },
    });

    if (!character) {
      throw new AppError('CHARACTER_NOT_FOUND', 'Character not found', 404);
    }

    // 2. Fetch Reward
    const reward = await tx.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward || !reward.isActive) {
      throw new AppError('REWARD_UNAVAILABLE', 'This reward is no longer available.', 400);
    }

    // 3. Check XP
    if (character.xp < reward.xpCost) {
      throw new AppError('INSUFFICIENT_XP', 'Not enough XP to redeem this reward.', 400);
    }

    // 4. Check Stock
    if (reward.remainingStock !== null) {
      if (reward.remainingStock <= 0) {
        throw new AppError('OUT_OF_STOCK', 'This reward is out of stock.', 400);
      }
    }

    // 5. Check Expiry
    if (reward.expiresAt && reward.expiresAt < new Date()) {
      throw new AppError('REWARD_EXPIRED', 'This reward has expired.', 400);
    }

    // 6. Deduct XP
    await tx.character.update({
      where: { userId },
      data: { xp: character.xp - reward.xpCost },
    });

    // 7. Deduct Stock
    if (reward.remainingStock !== null) {
      await tx.reward.update({
        where: { id: rewardId },
        data: { remainingStock: reward.remainingStock - 1 },
      });
    }

    // 8. Generate Coupon and create Redemption Record
    const couponCode = generateCouponCode();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 3); // Default 3 months validity for coupon

    const redemption = await tx.redeemedReward.create({
      data: {
        userId,
        rewardId,
        couponCode,
        expiresAt: expiry,
      },
      include: {
        reward: true,
      },
    });

    // 9. Create Activity Log
    await tx.activityLog.create({
      data: {
        userId,
        type: 'ITEM_PURCHASED',
        xpChange: -reward.xpCost,
        metadata: {
          rewardName: reward.name,
          couponCode,
        },
      },
    });

    return redemption;
  });
}

async function getUserRedemptions(userId) {
  const redemptions = await prisma.redeemedReward.findMany({
    where: { userId },
    include: {
      reward: true,
    },
    orderBy: { redeemedAt: 'desc' },
  });

  return redemptions;
}

module.exports = {
  getAllRewards,
  redeemReward,
  getUserRedemptions,
};
