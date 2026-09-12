const prisma = require('../../db/prisma');
const DateService = require('../utils/date.service');
const { AppError } = require('../../utils/errors');
const logger = require('../../errorlogging/logger');

const STREAK_RECOVERY_COST = 50;

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

  /**
   * Checks whether a character currently has an active, unbroken streak.
   */
  static isStreakActive(character, nowDate = new Date(), userOrTimezone = 'UTC') {
    if (!character || !character.lastActiveDate) {
      return false;
    }

    // If active today:
    if (DateService.isSameUserDay(character.lastActiveDate, nowDate, userOrTimezone)) {
      // If previousStreak > 0, it means the streak broke today when completing a task, so it is recoverable
      if (character.previousStreak > 0) {
        return false;
      }
      return true;
    }

    // If active yesterday, streak is currently active pending today's activity
    if (DateService.isConsecutiveUserDay(character.lastActiveDate, nowDate, userOrTimezone)) {
      return true;
    }

    return false;
  }

  /**
   * Restores a broken streak for 50 coins authoritatively within an ACID transaction.
   * Limited to once per calendar week.
   */
  static async recoverStreak(userId) {
    // 1. Resolve user timezone and weekly boundary
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true }
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }

    const tz = user.timezone || 'UTC';
    const now = new Date();
    const startOfWeek = DateService.getStartOfUserWeek(tz, now);

    // 2. Enforce once-per-week rate limit
    const existingRecoveryThisWeek = await prisma.activityLog.findFirst({
      where: {
        userId,
        type: 'STREAK_RECOVERED',
        createdAt: { gte: startOfWeek }
      }
    });

    if (existingRecoveryThisWeek) {
      throw new AppError(
        'STREAK_RECOVERY_LIMIT_REACHED',
        'Streak recovery can only be used once per calendar week',
        400
      );
    }

    // 3. Inspect character streak state
    const character = await prisma.character.findUnique({
      where: { userId }
    });

    if (!character) {
      throw new AppError('CHARACTER_NOT_FOUND', 'Character profile not found', 404);
    }

    // Cannot recover if user never had a streak
    if (character.currentStreak === 0 && character.previousStreak === 0) {
      throw new AppError('NO_STREAK_TO_RECOVER', 'No broken streak found to recover', 400);
    }

    // Cannot recover if streak is already active
    if (this.isStreakActive(character, now, tz)) {
      throw new AppError(
        'STREAK_ALREADY_ACTIVE',
        'Your streak is currently active and does not need recovery',
        400
      );
    }

    // Pre-flight balance check
    if (character.coins < STREAK_RECOVERY_COST) {
      throw new AppError(
        'INSUFFICIENT_COINS',
        `Insufficient coins. Required: ${STREAK_RECOVERY_COST}, Available: ${character.coins}`,
        400,
        { required: STREAK_RECOVERY_COST, currentCoins: character.coins }
      );
    }

    // 4. Execute atomic streak restoration transaction
    return await prisma.$transaction(async (tx) => {
      // Atomic conditional decrement guarantees row lock and prevents overdrafts
      const updateCoinsResult = await tx.character.updateMany({
        where: {
          userId,
          coins: { gte: STREAK_RECOVERY_COST }
        },
        data: {
          coins: { decrement: STREAK_RECOVERY_COST }
        }
      });

      if (updateCoinsResult.count === 0) {
        const currentChar = await tx.character.findUnique({
          where: { userId },
          select: { coins: true }
        });
        const availableCoins = currentChar ? currentChar.coins : 0;
        throw new AppError(
          'INSUFFICIENT_COINS',
          `Insufficient coins. Required: ${STREAK_RECOVERY_COST}, Available: ${availableCoins}`,
          400,
          { required: STREAK_RECOVERY_COST, currentCoins: availableCoins }
        );
      }

      // Compute restored streak
      let restoredStreak = 1;
      let restoredLastActive = character.lastActiveDate;

      if (character.previousStreak > 0) {
        // User broke streak today by completing a task; restore to previousStreak + 1
        restoredStreak = character.previousStreak + 1;
      } else if (character.currentStreak > 0) {
        // User missed a day and has not completed today's task yet; bridge gap to yesterday
        restoredStreak = character.currentStreak;
        const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);
        restoredLastActive = DateService.getStartOfUserDay(tz, yesterday);
      }

      const updatedCharacter = await tx.character.update({
        where: { userId },
        data: {
          currentStreak: restoredStreak,
          longestStreak: Math.max(restoredStreak, character.longestStreak),
          previousStreak: 0,
          lastActiveDate: restoredLastActive
        }
      });

      // Write STREAK_RECOVERED in ActivityLog for audit trail and rate limit enforcement
      await tx.activityLog.create({
        data: {
          userId,
          type: 'STREAK_RECOVERED',
          xpChange: 0,
          coinChange: -STREAK_RECOVERY_COST,
          metadata: {
            cost: STREAK_RECOVERY_COST,
            recoveredStreak: restoredStreak,
            recoveredAt: now
          }
        }
      });

      return {
        success: true,
        message: 'Streak successfully recovered!',
        currentStreak: updatedCharacter.currentStreak,
        longestStreak: updatedCharacter.longestStreak,
        remainingCoins: updatedCharacter.coins,
        cost: STREAK_RECOVERY_COST,
        recoveredAt: now
      };
    }, { timeout: 25000, maxWait: 20000 });
  }
}

module.exports = StreakService;
