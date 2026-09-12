const logger = require('../../errorlogging/logger');

class StreakService {
  /**
   * Calculates the new streak state based on calendar days.
   *
   * @param {number} currentStreak
   * @param {number} longestStreak
   * @param {Date|null} lastActiveDate
   * @param {Date} [nowDate]
   * @returns {{ currentStreak: number, longestStreak: number, streakIncreased: boolean, streakBroken: boolean, lastActiveDate: Date }}
   */
  static calculateStreak(currentStreak, longestStreak, lastActiveDate, nowDate = new Date()) {
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

      // Convert to YYYY-MM-DD strings based on UTC
      const lastDateStr = lastActiveDate.toISOString().split('T')[0];
      const nowDateStr = nowDate.toISOString().split('T')[0];

      if (lastDateStr === nowDateStr) {
        // Same calendar day
        return {
          currentStreak,
          longestStreak,
          streakIncreased: false,
          streakBroken: false,
          lastActiveDate // Keep original time or update to now? Usually keep last action time. Let's update to now to reflect latest activity.
        };
      }

      const lastDate = new Date(lastDateStr);
      const todayDate = new Date(nowDateStr);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      if (diffDays === 1) {
        // Consecutive calendar day
        const newCurrent = currentStreak + 1;
        return {
          currentStreak: newCurrent,
          longestStreak: Math.max(newCurrent, longestStreak),
          streakIncreased: true,
          streakBroken: false,
          lastActiveDate: nowDate
        };
      } else {
        // Broken streak (diffDays > 1)
        return {
          currentStreak: 1,
          longestStreak,
          streakIncreased: true, // It increased from 0 back to 1 for today
          streakBroken: true,
          lastActiveDate: nowDate
        };
      }
    } catch (error) {
      logger.error('Error calculating streak', { error, currentStreak, lastActiveDate });
      // Fallback: don't break anything
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
