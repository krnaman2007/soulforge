const { RPG_CONSTANTS } = require('../../config/constants');
const logger = require('../../errorlogging/logger');

class RewardService {
  /**
   * Calculates the XP and Coin rewards for a task based on the RPG specification.
   * FinalXP = round(BaseXP(Difficulty) * Multiplier(Effort) + Bonus(Impact) + Modifier(Priority))
   * CoinReward = max(5, round(FinalXP * 0.4))
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
      const finalXP = Math.round(rawXP / 5) * 5;
      
      const rawCoins = finalXP * RPG_CONSTANTS.COIN_REWARD_RATIO;
      const coinReward = Math.max(
        RPG_CONSTANTS.MIN_COIN_REWARD,
        Math.round(rawCoins / 5) * 5
      );

      return { xp: finalXP, coins: coinReward };
    } catch (error) {
      logger.error('Error calculating task reward', { error, difficulty, effort, impact, priority });
      // Safe fallback
      return { xp: 25, coins: 10 };
    }
  }
}

module.exports = RewardService;
