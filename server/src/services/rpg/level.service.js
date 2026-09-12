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
}

module.exports = LevelService;
