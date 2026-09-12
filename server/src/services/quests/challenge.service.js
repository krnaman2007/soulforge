const prisma = require('../../db/prisma');
const { AppError } = require('../../utils/errors');
const { RPG_CONSTANTS } = require('../../config/constants');
const LevelService = require('../rpg/level.service');
const AchievementService = require('../rpg/achievement.service');
const logger = require('../../errorlogging/logger');

class ChallengeService {
  static getStartOfDay(date = new Date()) {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  static getDailyPeriodKey(date = new Date()) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  static getStartOfWeek(date = new Date()) {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    const day = d.getUTCDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setUTCDate(d.getUTCDate() + diff);
    return d;
  }

  static getWeeklyPeriodKey(date = new Date()) {
    const start = this.getStartOfWeek(date);
    return `W-${start.toISOString().split('T')[0]}`;
  }

  /**
   * Get Daily Challenge status and progress
   */
  static async getDailyChallenge(userId) {
    const now = new Date();
    const periodKey = this.getDailyPeriodKey(now);
    const startOfDay = this.getStartOfDay(now);
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
   * Get Weekly Challenge status and progress
   */
  static async getWeeklyChallenge(userId) {
    const now = new Date();
    const periodKey = this.getWeeklyPeriodKey(now);
    const startOfWeek = this.getStartOfWeek(now);
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

    const now = new Date();
    const isDaily = type === 'DAILY';
    const periodKey = isDaily ? this.getDailyPeriodKey(now) : this.getWeeklyPeriodKey(now);
    const startDate = isDaily ? this.getStartOfDay(now) : this.getStartOfWeek(now);
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
        // 1. Record Claim
        const claim = await tx.challengeClaim.create({
          data: {
            userId,
            type,
            periodKey
          }
        });

        // 2. Fetch Character
        const character = await tx.character.findUnique({
          where: { userId }
        });

        if (!character) {
          throw new AppError('CHARACTER_NOT_FOUND', 'Character profile not found', 404);
        }

        // 3. Apply Level & XP progression authoritatively
        const levelUpData = LevelService.applyXP(
          character.level,
          character.xp,
          config.xpReward
        );

        // 4. Update Character stats
        const updatedCharacter = await tx.character.update({
          where: { userId },
          data: {
            level: levelUpData.newLevel,
            xp: levelUpData.remainingXP,
            coins: { increment: config.coinReward }
          }
        });

        // 5. Create ActivityLog
        await tx.activityLog.create({
          data: {
            userId,
            type: 'CHALLENGE_CLAIMED',
            xpChange: config.xpReward,
            coinChange: config.coinReward,
            metadata: {
              challengeType: type,
              periodKey,
              targetCount: config.targetCount,
              completedCount,
              levelUp: levelUpData.leveledUp,
              newLevel: levelUpData.newLevel
            }
          }
        });

        // 6. Evaluate Achievements (e.g. CHALLENGER, DEDICATED, HOARDER)
        let finalCharacter = updatedCharacter;
        let finalLevelUp = levelUpData;

        const newlyUnlockedAchievements = await AchievementService.evaluateChallengeAchievements(
          userId,
          tx,
          {
            challengeType: type,
            character: finalCharacter
          }
        );

        for (const ach of newlyUnlockedAchievements) {
          if (ach.rewardXP > 0) {
            const achLevelData = LevelService.applyXP(
              finalCharacter.level,
              finalCharacter.xp,
              ach.rewardXP
            );

            finalCharacter = await tx.character.update({
              where: { userId },
              data: {
                level: achLevelData.newLevel,
                xp: achLevelData.remainingXP,
                coins: { increment: ach.rewardCoins }
              }
            });

            if (achLevelData.leveledUp) {
              finalLevelUp = {
                leveledUp: true,
                oldLevel: levelUpData.oldLevel,
                newLevel: achLevelData.newLevel,
                nextLevelXP: achLevelData.nextLevelXP
              };
            }
          } else if (ach.rewardCoins > 0) {
            finalCharacter = await tx.character.update({
              where: { userId },
              data: {
                coins: { increment: ach.rewardCoins }
              }
            });
          }
        }

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
            leveledUp: finalLevelUp.leveledUp,
            oldLevel: finalLevelUp.oldLevel,
            newLevel: finalLevelUp.newLevel,
            nextLevelXP: finalLevelUp.nextLevelXP
          },
          character: {
            level: finalCharacter.level,
            xp: finalCharacter.xp,
            nextLevelXP: finalLevelUp.nextLevelXP,
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
      });
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
