const prisma = require('../../db/prisma');
const { AppError } = require('../../utils/errors');
const { RPG_CONSTANTS } = require('../../config/constants');
const RewardService = require('../rpg/reward.service');
const AchievementService = require('../rpg/achievement.service');
const DateService = require('../utils/date.service');
const logger = require('../../errorlogging/logger');

class ChallengeService {
  /**
   * Helper to retrieve user timezone
   */
  static async getUserTimezone(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true }
    });
    return user?.timezone || 'UTC';
  }

  /**
   * Get Daily Challenge status and progress in user's timezone
   */
  static async getDailyChallenge(userId) {
    const tz = await this.getUserTimezone(userId);
    const now = new Date();
    const periodKey = DateService.getDailyPeriodKey(tz, now);
    const startOfDay = DateService.getStartOfUserDay(tz, now);
    const config = RPG_CONSTANTS.CHALLENGE_CONFIG.DAILY;

    const [completedTasksCount, existingClaim] = await Promise.all([
      prisma.activityLog.count({
        where: {
          userId,
          type: 'TASK_COMPLETED',
          createdAt: { gte: startOfDay }
        }
      }),
      prisma.challengeClaim.findUnique({
        where: {
          userId_type_periodKey: {
            userId,
            type: 'DAILY',
            periodKey
          }
        }
      })
    ]);

    const isCompleted = completedTasksCount >= config.targetCount;
    const isClaimed = !!existingClaim;
    const canClaim = isCompleted && !isClaimed;
    const progress = Math.min(1.0, Number((completedTasksCount / config.targetCount).toFixed(2)));

    return {
      type: 'DAILY',
      title: config.title,
      description: config.description,
      periodKey,
      targetCount: config.targetCount,
      completedCount: completedTasksCount,
      progress,
      isCompleted,
      isClaimed,
      claimedAt: existingClaim ? existingClaim.claimedAt : null,
      canClaim,
      rewards: {
        xp: config.xpReward,
        coins: config.coinReward
      }
    };
  }

  /**
   * Get Weekly Challenge status and progress in user's timezone
   */
  static async getWeeklyChallenge(userId) {
    const tz = await this.getUserTimezone(userId);
    const now = new Date();
    const periodKey = DateService.getWeeklyPeriodKey(tz, now);
    const startOfWeek = DateService.getStartOfUserWeek(tz, now);
    const config = RPG_CONSTANTS.CHALLENGE_CONFIG.WEEKLY;

    const [completedTasksCount, existingClaim] = await Promise.all([
      prisma.activityLog.count({
        where: {
          userId,
          type: 'TASK_COMPLETED',
          createdAt: { gte: startOfWeek }
        }
      }),
      prisma.challengeClaim.findUnique({
        where: {
          userId_type_periodKey: {
            userId,
            type: 'WEEKLY',
            periodKey
          }
        }
      })
    ]);

    const isCompleted = completedTasksCount >= config.targetCount;
    const isClaimed = !!existingClaim;
    const canClaim = isCompleted && !isClaimed;
    const progress = Math.min(1.0, Number((completedTasksCount / config.targetCount).toFixed(2)));

    return {
      type: 'WEEKLY',
      title: config.title,
      description: config.description,
      periodKey,
      targetCount: config.targetCount,
      completedCount: completedTasksCount,
      progress,
      isCompleted,
      isClaimed,
      claimedAt: existingClaim ? existingClaim.claimedAt : null,
      canClaim,
      rewards: {
        xp: config.xpReward,
        coins: config.coinReward
      }
    };
  }

  /**
   * Claim reward for Daily or Weekly challenge
   */
  static async claimChallenge(userId, typeRaw) {
    const type = typeRaw.toUpperCase();
    if (type !== 'DAILY' && type !== 'WEEKLY') {
      throw new AppError('INVALID_CHALLENGE_TYPE', 'Challenge type must be either DAILY or WEEKLY', 400);
    }

    const tz = await this.getUserTimezone(userId);
    const now = new Date();
    const isDaily = type === 'DAILY';
    const periodKey = isDaily ? DateService.getDailyPeriodKey(tz, now) : DateService.getWeeklyPeriodKey(tz, now);
    const startDate = isDaily ? DateService.getStartOfUserDay(tz, now) : DateService.getStartOfUserWeek(tz, now);
    const config = isDaily ? RPG_CONSTANTS.CHALLENGE_CONFIG.DAILY : RPG_CONSTANTS.CHALLENGE_CONFIG.WEEKLY;

    // Verify completion count
    const completedCount = await prisma.activityLog.count({
      where: {
        userId,
        type: 'TASK_COMPLETED',
        createdAt: { gte: startDate }
      }
    });

    if (completedCount < config.targetCount) {
      throw new AppError(
        'CHALLENGE_NOT_COMPLETED',
        `Challenge not completed yet (${completedCount}/${config.targetCount} tasks done)`,
        400
      );
    }

    // Check existing claim pre-flight
    const existing = await prisma.challengeClaim.findUnique({
      where: {
        userId_type_periodKey: {
          userId,
          type,
          periodKey
        }
      }
    });

    if (existing) {
      throw new AppError('CHALLENGE_ALREADY_CLAIMED', 'You have already claimed this challenge reward', 409);
    }

    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Record Claim (composite unique index protects against races)
        const claim = await tx.challengeClaim.create({
          data: {
            userId,
            type,
            periodKey
          }
        });

        // Record CHALLENGE_CLAIMED action event in ActivityLog
        await tx.activityLog.create({
          data: {
            userId,
            type: 'CHALLENGE_CLAIMED',
            xpChange: 0,
            coinChange: 0,
            metadata: {
              challengeType: type,
              periodKey,
              targetCount: config.targetCount,
              completedCount,
              xpReward: config.xpReward,
              coinReward: config.coinReward
            }
          }
        });

        // 2. Authoritatively Grant Challenge Rewards via RewardService (writes canonical XP_GAINED log)
        const rewardResult = await RewardService.grantRewards(userId, tx, {
          xp: config.xpReward,
          coins: config.coinReward,
          source: 'CHALLENGE_CLAIMED',
          metadata: {
            challengeType: type,
            periodKey,
            targetCount: config.targetCount,
            completedCount
          }
        });

        // 3. Evaluate Achievements (CHALLENGER, DEDICATED, etc.)
        const newlyUnlockedAchievements = await AchievementService.evaluate(
          'CHALLENGE_CLAIMED',
          userId,
          tx,
          {
            challengeType: type,
            periodKey,
            timezone: tz
          }
        );

        // Fetch latest authoritative character
        const finalCharacter = await tx.character.findUnique({ where: { userId } });

        return {
          success: true,
          message: `${type} challenge claimed successfully`,
          claim: {
            id: claim.id,
            type: claim.type,
            periodKey: claim.periodKey,
            claimedAt: claim.claimedAt
          },
          rewards: {
            xp: config.xpReward,
            coins: config.coinReward
          },
          levelUp: {
            leveledUp: finalCharacter.level > rewardResult.levelUp.oldLevel,
            oldLevel: rewardResult.levelUp.oldLevel,
            newLevel: finalCharacter.level,
            nextLevelXP: RewardService.calculateLevel(finalCharacter.level, finalCharacter.xp, 0).nextLevelXP
          },
          character: {
            level: finalCharacter.level,
            xp: finalCharacter.xp,
            nextLevelXP: RewardService.calculateLevel(finalCharacter.level, finalCharacter.xp, 0).nextLevelXP,
            coins: finalCharacter.coins
          },
          achievementsUnlocked: newlyUnlockedAchievements.map(a => ({
            id: a.id,
            code: a.code,
            name: a.name,
            description: a.description,
            rewardXP: a.rewardXP,
            rewardCoins: a.rewardCoins,
            badge: a.badge,
            rewardTitle: a.rewardTitle
          }))
        };
      }, { timeout: 15000, maxWait: 10000 });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError('CHALLENGE_ALREADY_CLAIMED', 'You have already claimed this challenge reward', 409);
      }
      logger.error('Error claiming challenge reward', { error, userId, type });
      throw error;
    }
  }
}

module.exports = ChallengeService;
