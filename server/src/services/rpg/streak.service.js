const DateService = require('../utils/date.service');
const logger = require('../../errorlogging/logger');

class StreakService {
  /**
   * Calculates the new streak state based on user-local calendar days.
   *
   * @param {number} currentStreak
   * @param {number} longestStreak
   * @param {Date|null} lastActiveDate
   * @param {Date} [nowDate=new Date()]
   * @param {string|Object} [userOrTimezone='UTC']
   * @returns {{ currentStreak: number, longestStreak: number, streakIncreased: boolean, streakBroken: boolean, lastActiveDate: Date }}
   */
  static calculateStreak(currentStreak, longestStreak, lastActiveDate, nowDate = new Date(), userOrTimezone = 'UTC') {
    try {
      if (!lastActiveDate) {
        return {
          currentStreak: 1,
          longestStreak: Math.max(1, longestStreak),
          streakIncreased: true,
          streakBroken: false,
          lastActiveDate: nowDate
        };
      }

      // Check same calendar day in user local timezone
      if (DateService.isSameUserDay(lastActiveDate, nowDate, userOrTimezone)) {
        return {
          currentStreak,
          longestStreak,
          streakIncreased: false,
          streakBroken: false,
          lastActiveDate: nowDate
        };
      }

      // Check consecutive calendar day in user local timezone
      if (DateService.isConsecutiveUserDay(lastActiveDate, nowDate, userOrTimezone)) {
        const newCurrent = currentStreak + 1;
        return {
          currentStreak: newCurrent,
          longestStreak: Math.max(newCurrent, longestStreak),
          streakIncreased: true,
          streakBroken: false,
          lastActiveDate: nowDate
        };
      }

      // Broken streak: more than 1 day skipped in user local timezone
      return {
        currentStreak: 1,
        longestStreak,
        streakIncreased: true,
        streakBroken: true,
        lastActiveDate: nowDate
      };
    } catch (error) {
      logger.error('Error calculating streak', { error, currentStreak, lastActiveDate, userOrTimezone });
      // Safe fallback
      return {
        currentStreak,
        longestStreak,
        streakIncreased: false,
        streakBroken: false,
        lastActiveDate: nowDate
      };
    }
  }
}

module.exports = StreakService;
