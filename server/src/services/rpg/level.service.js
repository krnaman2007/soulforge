const { RPG_CONSTANTS } = require('../../config/constants');
const logger = require('../../errorlogging/logger');

class LevelService {
  /**
   * Calculates the exact amount of XP required to advance from Level L to Level L + 1.
   * RequiredXP(L) = floor(100 * L^1.6)
   *
   * @param {number} level - The hero's current level
   * @returns {number}
   */
  static getRequiredXP(level) {
    if (level < 1) return RPG_CONSTANTS.BASE_XP_SCALE;
    return Math.floor(RPG_CONSTANTS.BASE_XP_SCALE * Math.pow(level, RPG_CONSTANTS.LEVEL_EXPONENT));
  }

  /**
   * Applies XP to a character and calculates level ups recursively.
   *
   * @param {number} currentLevel
   * @param {number} currentXP
   * @param {number} xpToAdd
   * @returns {{ oldLevel: number, newLevel: number, leveledUp: boolean, remainingXP: number, nextLevelXP: number }}
   */
  static applyXP(currentLevel, currentXP, xpToAdd) {
    try {
      const oldLevel = currentLevel;
      let totalXP = currentXP + xpToAdd;
      let newLevel = currentLevel;

      while (true) {
        const needed = this.getRequiredXP(newLevel);
        if (totalXP >= needed) {
          totalXP -= needed;
          newLevel += 1;
        } else {
          break;
        }
      }

      return {
        oldLevel,
        newLevel,
        leveledUp: newLevel > oldLevel,
        remainingXP: totalXP,
        nextLevelXP: this.getRequiredXP(newLevel)
      };
    } catch (error) {
      logger.error('Error applying XP', { error, currentLevel, currentXP, xpToAdd });
      // Fallback to prevent crash, no level up
      return {
        oldLevel: currentLevel,
        newLevel: currentLevel,
        leveledUp: false,
        remainingXP: currentXP + xpToAdd,
        nextLevelXP: this.getRequiredXP(currentLevel)
      };
    }
  }

  /**
   * Calculates total cumulative XP earned from level 1 up to current level and remaining XP.
   *
   * @param {number} level - Current character level
   * @param {number} currentXP - Remaining progress XP within the current level
   * @returns {number} Total lifetime cumulative XP
   */
  static calculateTotalXP(level, currentXP = 0) {
    let total = Math.max(0, currentXP);
    for (let lvl = 1; lvl < level; lvl++) {
      total += this.getRequiredXP(lvl);
    }
    return total;
  }

  /**
   * Derives rank title and tier based on total lifetime XP.
   *
   * @param {number} xp - Total lifetime XP
   * @returns {{ rankTitle: string, tier: number }}
   */
  static getRankTier(xp) {
    if (xp >= 120000) return { rankTitle: "Grand Master", tier: 8 };
    if (xp >= 80000) return { rankTitle: "Master", tier: 7 };
    if (xp >= 50000) return { rankTitle: "Diamond", tier: 6 };
    if (xp >= 30000) return { rankTitle: "Platinum", tier: 5 };
    if (xp >= 15000) return { rankTitle: "Gold", tier: 4 };
    if (xp >= 5000) return { rankTitle: "Silver", tier: 3 };
    if (xp >= 1000) return { rankTitle: "Bronze", tier: 2 };
    return { rankTitle: "Iron", tier: 1 };
  }
}

module.exports = LevelService;
