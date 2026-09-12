const prisma = require('../../db/prisma');
const { AppError } = require('../../utils/errors');
const logger = require('../../errorlogging/logger');
const { ACHIEVEMENT_CATALOG } = require('../../config/achievementCatalog');
const RewardService = require('./reward.service');
const DateService = require('../utils/date.service');

class AchievementService {
  /**
   * Idempotently seeds the achievement catalog if not already populated.
   */
  static async ensureCatalog() {
    try {
      const count = await prisma.achievement.count();
      if (count < ACHIEVEMENT_CATALOG.length) {
        for (const ach of ACHIEVEMENT_CATALOG) {
          await prisma.achievement.upsert({
            where: { code: ach.code },
            update: {
              name: ach.name,
              description: ach.description,
              type: ach.type,
              requirement: ach.requirement,
              rewardCoins: ach.rewardCoins,
              rewardXP: ach.rewardXP,
              badge: ach.badge,
              rewardTitle: ach.rewardTitle
            },
            create: {
              code: ach.code,
              name: ach.name,
              description: ach.description,
              type: ach.type,
              requirement: ach.requirement,
              rewardCoins: ach.rewardCoins,
              rewardXP: ach.rewardXP,
              badge: ach.badge,
              rewardTitle: ach.rewardTitle
            }
          });
        }
      }
    } catch (err) {
      logger.warn('Failed to ensure achievement catalog seeded', { error: err.message });
    }
  }

  /**
   * Unified entry point to evaluate achievements triggered by game events.
   *
   * @param {string} event - TASK_COMPLETED | CHALLENGE_CLAIMED | QUEST_COMPLETED
   * @param {string} userId
   * @param {Object} tx - Prisma transaction client
   * @param {Object} context
   * @returns {Promise<Array<Object>>} Newly unlocked achievements
   */
  static async evaluate(event, userId, tx, context = {}) {
    if (event === 'TASK_COMPLETED' || event === 'QUEST_COMPLETED') {
      return this.evaluateTaskAchievements(userId, tx, context);
    }
    if (event === 'CHALLENGE_CLAIMED') {
      return this.evaluateChallengeAchievements(userId, tx, context);
    }
    return [];
  }

  /**
   * Evaluates and unlocks any achievements earned during task completion.
   * Runs within an existing transaction `tx`.
   *
   * @param {string} userId
   * @param {any} tx - Prisma transaction client
   * @param {Object} context
   * @returns {Promise<Array<Object>>} List of newly unlocked achievements
   */
  static async evaluateTaskAchievements(userId, tx, context = {}) {
    const { task, questCompleted, streakData, completionTime, timezone = 'UTC' } = context;

    try {
      // 1. Fetch already unlocked achievements to avoid duplicate work
      const existingUserAchievements = await tx.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: {
            select: { code: true }
          }
        }
      });

      const unlockedCodes = new Set(existingUserAchievements.map(ua => ua.achievement.code));

      // 2. Fetch all achievements in catalog
      const allAchievements = await tx.achievement.findMany();
      const lockedAchievements = allAchievements.filter(ach => !unlockedCodes.has(ach.code));

      if (lockedAchievements.length === 0) {
        return [];
      }

      // 3. Compute metrics required for locked achievements
      const hasTaskMetric = lockedAchievements.some(a => a.type === 'TASK');
      const hasProjectMetric = lockedAchievements.some(a => a.type === 'PROJECT');

      let totalCompletedTasks = 0;
      let attributeCounts = {};
      let isEarlyMorning = false;

      if (hasTaskMetric) {
        totalCompletedTasks = await tx.task.count({
          where: { userId, status: 'COMPLETED' }
        });

        // Current completion time check for EARLY_RISER in user's local timezone
        const timestamp = completionTime || new Date();
        const hour = DateService.getUserHour(timestamp, timezone);
        if (hour < 8) {
          isEarlyMorning = true;
        }

        // Check if any attribute count is needed
        const attrMetrics = lockedAchievements.filter(
          a => a.requirement && a.requirement.metric === 'ATTRIBUTE_TASK_COUNT'
        );

        for (const am of attrMetrics) {
          const cat = am.requirement.attribute;
          if (cat && attributeCounts[cat] === undefined) {
            attributeCounts[cat] = await tx.task.count({
              where: { userId, status: 'COMPLETED', primaryAttribute: cat }
            });
          }
        }
      }

      // Fetch fresh character for streak / level / economy
      const character = await tx.character.findUnique({ where: { userId } });
      const currentStreak = streakData ? streakData.currentStreak : (character ? character.currentStreak : 0);
      const currentLevel = character ? character.level : 1;
      const currentCoins = character ? character.coins : 0;

      let completedProjects = 0;
      if (hasProjectMetric) {
        completedProjects = await tx.project.count({
          where: { userId, status: 'COMPLETED' }
        });
      }

      const newlyUnlocked = [];

      // 4. Evaluate each locked achievement against metrics
      for (const ach of lockedAchievements) {
        const req = ach.requirement || {};
        let conditionMet = false;

        switch (req.metric) {
          case 'TASK_COUNT':
            conditionMet = totalCompletedTasks >= (req.target || 1);
            break;

          case 'ATTRIBUTE_TASK_COUNT':
            const catCount = attributeCounts[req.attribute] || 0;
            conditionMet = catCount >= (req.target || 1);
            break;

          case 'STREAK_DAYS':
            conditionMet = currentStreak >= (req.target || 1);
            break;

          case 'LEVEL':
            conditionMet = currentLevel >= (req.target || 1);
            break;

          case 'QUEST_COUNT':
            conditionMet = questCompleted || completedProjects >= (req.target || 1);
            break;

          case 'COIN_BALANCE':
            conditionMet = currentCoins >= (req.target || 1000);
            break;

          case 'EARLY_RISER':
            conditionMet = isEarlyMorning;
            break;

          default:
            break;
        }

        if (conditionMet) {
          // Persist unlock
          await tx.userAchievement.create({
            data: {
              userId,
              achievementId: ach.id
            }
          });

          // Route bonus XP and Coins authoritatively through RewardService (writes single authoritative ACHIEVEMENT_UNLOCKED log)
          if (ach.rewardXP > 0 || ach.rewardCoins > 0) {
            await RewardService.grantRewards(userId, tx, {
              xp: ach.rewardXP,
              coins: ach.rewardCoins,
              source: 'ACHIEVEMENT_UNLOCKED',
              metadata: {
                achievementCode: ach.code,
                achievementName: ach.name,
                badge: ach.badge,
                rewardTitle: ach.rewardTitle,
                rewardXP: ach.rewardXP,
                rewardCoins: ach.rewardCoins
              }
            });
          } else {
            await tx.activityLog.create({
              data: {
                userId,
                type: 'ACHIEVEMENT_UNLOCKED',
                xpChange: 0,
                coinChange: 0,
                metadata: {
                  achievementCode: ach.code,
                  achievementName: ach.name,
                  badge: ach.badge,
                  rewardTitle: ach.rewardTitle,
                  rewardXP: 0,
                  rewardCoins: 0
                }
              }
            });
          }

          newlyUnlocked.push(ach);
        }
      }

      return newlyUnlocked;
    } catch (error) {
      logger.error('Error evaluating task achievements', { error: error.message, userId });
      return [];
    }
  }

  /**
   * Evaluates and unlocks any achievements earned during challenge claims.
   *
   * @param {string} userId
   * @param {any} tx
   * @param {Object} context
   * @returns {Promise<Array<Object>>}
   */
  static async evaluateChallengeAchievements(userId, tx, context = {}) {
    try {
      const existingUserAchievements = await tx.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: {
            select: { code: true }
          }
        }
      });

      const unlockedCodes = new Set(existingUserAchievements.map(ua => ua.achievement.code));

      const allAchievements = await tx.achievement.findMany({
        where: {
          type: { in: ['CHALLENGE', 'ECONOMY'] }
        }
      });

      const lockedAchievements = allAchievements.filter(ach => !unlockedCodes.has(ach.code));

      if (lockedAchievements.length === 0) {
        return [];
      }

      const [dailyCount, weeklyCount, character] = await Promise.all([
        tx.challengeClaim.count({ where: { userId, type: 'DAILY' } }),
        tx.challengeClaim.count({ where: { userId, type: 'WEEKLY' } }),
        tx.character.findUnique({ where: { userId } })
      ]);

      const coins = character ? character.coins : 0;
      const newlyUnlocked = [];

      for (const ach of lockedAchievements) {
        const req = ach.requirement || {};
        let conditionMet = false;

        if (req.metric === 'CHALLENGE_COUNT') {
          if (req.challengeType === 'DAILY') {
            conditionMet = dailyCount >= (req.target || 10);
          } else if (req.challengeType === 'WEEKLY') {
            conditionMet = weeklyCount >= (req.target || 4);
          }
        } else if (req.metric === 'COIN_BALANCE') {
          conditionMet = coins >= (req.target || 1000);
        }

        if (conditionMet) {
          await tx.userAchievement.create({
            data: {
              userId,
              achievementId: ach.id
            }
          });

          // Route bonus XP and Coins authoritatively through RewardService (writes single authoritative ACHIEVEMENT_UNLOCKED log)
          if (ach.rewardXP > 0 || ach.rewardCoins > 0) {
            await RewardService.grantRewards(userId, tx, {
              xp: ach.rewardXP,
              coins: ach.rewardCoins,
              source: 'ACHIEVEMENT_UNLOCKED',
              metadata: {
                achievementCode: ach.code,
                achievementName: ach.name,
                badge: ach.badge,
                rewardTitle: ach.rewardTitle,
                rewardXP: ach.rewardXP,
                rewardCoins: ach.rewardCoins
              }
            });
          } else {
            await tx.activityLog.create({
              data: {
                userId,
                type: 'ACHIEVEMENT_UNLOCKED',
                xpChange: 0,
                coinChange: 0,
                metadata: {
                  achievementCode: ach.code,
                  achievementName: ach.name,
                  badge: ach.badge,
                  rewardTitle: ach.rewardTitle,
                  rewardXP: 0,
                  rewardCoins: 0
                }
              }
            });
          }

          newlyUnlocked.push(ach);
        }
      }

      return newlyUnlocked;
    } catch (error) {
      logger.error('Error evaluating challenge achievements', { error: error.message, userId });
      return [];
    }
  }

  /**
   * Lists all achievements with computed unlock status and derived progress for user.
   */
  static async getAllAchievements(userId = null, query = {}) {
    await this.ensureCatalog();

    const where = {};
    if (query.type) {
      where.type = query.type;
    }

    const achievements = await prisma.achievement.findMany({
      where,
      orderBy: [{ type: 'asc' }, { rewardXP: 'asc' }]
    });

    if (!userId) {
      return achievements.map(ach => ({
        ...ach,
        isUnlocked: false,
        unlockedAt: null,
        progress: {
          current: 0,
          target: ach.requirement?.target || 1,
          percentage: 0
        }
      }));
    }

    // Load user state for authoritative derived progress calculation
    const [userAchievements, character, taskCount, completedQuests, dailyClaims, weeklyClaims] = await Promise.all([
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true, unlockedAt: true }
      }),
      prisma.character.findUnique({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.project.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.challengeClaim.count({ where: { userId, type: 'DAILY' } }),
      prisma.challengeClaim.count({ where: { userId, type: 'WEEKLY' } })
    ]);

    const unlockMap = new Map(userAchievements.map(ua => [ua.achievementId, ua.unlockedAt]));

    // Preload attribute counts for progress derivation
    const attributeGroup = await prisma.task.groupBy({
      by: ['primaryAttribute'],
      where: { userId, status: 'COMPLETED' },
      _count: { _all: true }
    });

    const attrMap = {};
    for (const ag of attributeGroup) {
      attrMap[ag.primaryAttribute] = ag._count._all;
    }

    return achievements.map(ach => {
      const isUnlocked = unlockMap.has(ach.id);
      const unlockedAt = unlockMap.get(ach.id) || null;
      const req = ach.requirement || {};
      const target = req.target || 1;
      let current = 0;

      if (isUnlocked) {
        current = target;
      } else {
        switch (req.metric) {
          case 'TASK_COUNT':
            current = taskCount;
            break;
          case 'ATTRIBUTE_TASK_COUNT':
            current = attrMap[req.attribute] || 0;
            break;
          case 'STREAK_DAYS':
            current = character ? character.currentStreak : 0;
            break;
          case 'LEVEL':
            current = character ? character.level : 1;
            break;
          case 'QUEST_COUNT':
            current = completedQuests;
            break;
          case 'CHALLENGE_COUNT':
            current = req.challengeType === 'DAILY' ? dailyClaims : weeklyClaims;
            break;
          case 'COIN_BALANCE':
            current = character ? character.coins : 0;
            break;
          case 'EARLY_RISER':
            current = 0;
            break;
          default:
            current = 0;
            break;
        }
      }

      const clampedCurrent = Math.min(current, target);
      const percentage = target > 0 ? Math.min(100, Math.round((clampedCurrent / target) * 100)) : 0;

      return {
        id: ach.id,
        code: ach.code,
        name: ach.name,
        description: ach.description,
        type: ach.type,
        requirement: ach.requirement,
        rewardXP: ach.rewardXP,
        rewardCoins: ach.rewardCoins,
        badge: ach.badge,
        rewardTitle: ach.rewardTitle,
        isUnlocked,
        unlockedAt,
        progress: {
          current: clampedCurrent,
          target,
          percentage
        }
      };
    });
  }

  /**
   * Retrieves summary of user's unlocked achievements.
   */
  static async getMyAchievements(userId) {
    await this.ensureCatalog();

    const [totalCatalogCount, userAchievements] = await Promise.all([
      prisma.achievement.count(),
      prisma.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true
        },
        orderBy: { unlockedAt: 'desc' }
      })
    ]);

    const totalUnlocked = userAchievements.length;
    const completionPercentage = totalCatalogCount > 0
      ? Math.round((totalUnlocked / totalCatalogCount) * 100)
      : 0;

    let totalXPEarned = 0;
    let totalCoinsEarned = 0;

    for (const ua of userAchievements) {
      totalXPEarned += ua.achievement.rewardXP || 0;
      totalCoinsEarned += ua.achievement.rewardCoins || 0;
    }

    return {
      summary: {
        totalUnlocked,
        totalAvailable: totalCatalogCount,
        completionPercentage,
        totalXPEarned,
        totalCoinsEarned
      },
      unlockedAchievements: userAchievements.map(ua => ({
        id: ua.achievement.id,
        code: ua.achievement.code,
        name: ua.achievement.name,
        description: ua.achievement.description,
        type: ua.achievement.type,
        rewardXP: ua.achievement.rewardXP,
        rewardCoins: ua.achievement.rewardCoins,
        badge: ua.achievement.badge,
        rewardTitle: ua.achievement.rewardTitle,
        unlockedAt: ua.unlockedAt
      }))
    };
  }

  /**
   * Retrieves specific achievement details and user status.
   */
  static async getAchievementById(userId, achievementId) {
    const ach = await prisma.achievement.findUnique({
      where: { id: achievementId }
    });

    if (!ach) {
      throw new AppError('ACHIEVEMENT_NOT_FOUND', 'Achievement not found', 404);
    }

    const all = await this.getAllAchievements(userId);
    const found = all.find(a => a.id === achievementId);
    return found || ach;
  }
}

module.exports = AchievementService;
