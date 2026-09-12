const prisma = require('../../db/prisma');
const { RPG_CONSTANTS, REWARD_BOUNDS } = require('../../config/constants');
const LevelService = require('./level.service');
const AttributeService = require('./attribute.service');
const { AppError } = require('../../utils/errors');
const logger = require('../../errorlogging/logger');

class RewardService {
  /**
   * Calculates XP and Coin rewards for a task based on difficulty, effort, impact, and priority.
   * Rewards are deterministically calculated and strictly bounded by backend maximums to prevent exploits.
   *
   * @param {Object} params
   * @param {string} params.difficulty - EASY | MEDIUM | HARD | EPIC
   * @param {string} params.effort - LOW | MEDIUM | HIGH
   * @param {string} params.impact - LOW | MEDIUM | HIGH
   * @param {string} params.priority - LOW | MEDIUM | HIGH | URGENT
   * @returns {{ xp: number, coins: number }}
   */
  static calculateTaskReward({ difficulty, effort, impact, priority }) {
    try {
      const baseXP = RPG_CONSTANTS.DIFFICULTY_XP[difficulty] || RPG_CONSTANTS.DIFFICULTY_XP.MEDIUM;
      const effortMult = RPG_CONSTANTS.EFFORT_MULTIPLIER[effort] || RPG_CONSTANTS.EFFORT_MULTIPLIER.MEDIUM;
      const impactBonus = RPG_CONSTANTS.IMPACT_BONUS[impact] || RPG_CONSTANTS.IMPACT_BONUS.MEDIUM;
      const priorityMod = RPG_CONSTANTS.PRIORITY_BONUS[priority] || RPG_CONSTANTS.PRIORITY_BONUS.MEDIUM;

      const rawXP = (baseXP * effortMult) + impactBonus + priorityMod;
      const roundedXP = Math.round(rawXP / 5) * 5;

      // Authoritative Clamping
      const finalXP = Math.min(
        REWARD_BOUNDS.MAX_TASK_XP,
        Math.max(REWARD_BOUNDS.MIN_TASK_XP, roundedXP)
      );

      const rawCoins = finalXP * RPG_CONSTANTS.COIN_REWARD_RATIO;
      const roundedCoins = Math.round(rawCoins / 5) * 5;

      const coinReward = Math.min(
        REWARD_BOUNDS.MAX_TASK_COINS,
        Math.max(REWARD_BOUNDS.MIN_TASK_COINS, roundedCoins)
      );

      return { xp: finalXP, coins: coinReward };
    } catch (error) {
      logger.error('Error calculating task reward', { error, difficulty, effort, impact, priority });
      return {
        xp: REWARD_BOUNDS.MIN_TASK_XP,
        coins: REWARD_BOUNDS.MIN_TASK_COINS
      };
    }
  }

  /**
   * Evaluates recursive level-up advances for a given XP gain.
   */
  static calculateLevel(currentLevel, currentXP, xpToAdd) {
    return LevelService.applyXP(currentLevel, currentXP, xpToAdd);
  }

  /**
   * The Single Authoritative Mutator for Character Progression.
   * Nobody except this method directly mutates character.xp, character.coins, character.level, or character attributes.
   *
   * @param {string} userId
   * @param {Object} [tx] - Prisma transaction client (optional, creates transaction if omitted)
   * @param {Object} options
   * @param {number} [options.xp=0]
   * @param {number} [options.coins=0]
   * @param {string} [options.primaryAttribute]
   * @param {string[]} [options.secondaryAttributes]
   * @param {string} [options.difficulty='MEDIUM']
   * @param {string} [options.source] - ActivityType enum or action identifier
   * @param {string} [options.taskId]
   * @param {string} [options.projectId]
   * @param {string} [options.itemId]
   * @param {Object} [options.metadata]
   * @returns {Promise<{ character: Object, levelUp: Object, rewardsGranted: Object }>}
   */
  static async grantRewards(userId, tx, options = {}) {
    const execute = async (db) => {
      const {
        xp = 0,
        coins = 0,
        primaryAttribute,
        secondaryAttributes = [],
        difficulty = 'MEDIUM',
        source,
        taskId,
        projectId,
        itemId,
        metadata = {}
      } = options;

      const safeXP = Math.max(0, Math.round(Number(xp) || 0));
      const safeCoins = Math.max(0, Math.round(Number(coins) || 0));

      // 1. Fetch Character
      const character = await db.character.findUnique({
        where: { userId }
      });

      if (!character) {
        throw new AppError('CHARACTER_NOT_FOUND', 'Character profile not found for user', 404);
      }

      // 2. Authoritative Level & XP Progression
      const levelUpData = LevelService.applyXP(character.level, character.xp, safeXP);

      // 3. Authoritative Attribute Gains
      let attributeGains = {};
      if (primaryAttribute) {
        attributeGains = AttributeService.calculateAttributeGains({
          primaryAttribute,
          secondaryAttributes,
          difficulty
        });
      }

      // 4. Prepare Character Mutations
      const updateData = {
        level: levelUpData.newLevel,
        xp: levelUpData.remainingXP
      };

      if (safeCoins > 0) {
        updateData.coins = { increment: safeCoins };
      }

      for (const [field, gain] of Object.entries(attributeGains)) {
        if (gain > 0) {
          updateData[field] = { increment: gain };
        }
      }

      // 5. Mutate Character atomically
      const updatedCharacter = await db.character.update({
        where: { userId },
        data: updateData
      });

      // 6. Write single authoritative ActivityLog entry within same transactional boundary
      const logType = source || (safeXP > 0 ? 'XP_GAINED' : null);
      if (logType) {
        await db.activityLog.create({
          data: {
            userId,
            type: logType,
            taskId: taskId || null,
            projectId: projectId || null,
            itemId: itemId || null,
            xpChange: safeXP,
            coinChange: safeCoins,
            metadata: {
              levelUp: levelUpData.leveledUp,
              oldLevel: levelUpData.oldLevel,
              newLevel: levelUpData.newLevel,
              attributeGains,
              ...metadata
            }
          }
        });
      }

      return {
        character: updatedCharacter,
        levelUp: {
          leveledUp: levelUpData.leveledUp,
          oldLevel: levelUpData.oldLevel,
          newLevel: levelUpData.newLevel,
          nextLevelXP: levelUpData.nextLevelXP
        },
        rewardsGranted: {
          xp: safeXP,
          coins: safeCoins,
          attributeGains
        }
      };
    };

    if (tx) {
      return execute(tx);
    }
    return prisma.$transaction(execute, { timeout: 25000, maxWait: 20000 });
  }

  /**
   * Convenience helper to grant XP authoritatively.
   */
  static async grantXP(userId, tx, xpAmount, options = {}) {
    return this.grantRewards(userId, tx, { ...options, xp: xpAmount });
  }

  /**
   * Convenience helper to grant Coins authoritatively.
   */
  static async grantCoins(userId, tx, coinAmount, options = {}) {
    return this.grantRewards(userId, tx, { ...options, coins: coinAmount });
  }
}

module.exports = RewardService;
