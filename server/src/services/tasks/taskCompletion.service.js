const prisma = require('../../db/prisma');
const TaskIntegrityService = require('./taskIntegrity.service');
const RewardService = require('../rpg/reward.service');
const StreakService = require('../rpg/streak.service');
const AchievementService = require('../rpg/achievement.service');
const DateService = require('../utils/date.service');
const LevelService = require('../rpg/level.service');
const { AppError } = require('../../utils/errors');
const logger = require('../../errorlogging/logger');

class TaskCompletionService {
  /**
   * Completes a task, applying anti-cheat verification, and grants authoritative rewards.
   * All mutations occur within a single ACID transaction via the central RewardService.
   */
  static async completeTask(userId, taskId) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch User (for timezone) and Task
      const [user, task] = await Promise.all([
        tx.user.findUnique({ where: { id: userId } }),
        tx.task.findFirst({ where: { id: taskId, userId } })
      ]);

      if (!user) {
        throw new AppError('USER_NOT_FOUND', 'User not found', 404);
      }
      if (!task) {
        throw new AppError('TASK_NOT_FOUND', 'Task not found', 404);
      }
      if (task.status === 'COMPLETED') {
        throw new AppError('TASK_ALREADY_COMPLETED', 'This quest was already completed!', 400);
      }

      // 2. Anti-Cheat Verification (in user local calendar day)
      const userStartOfDay = DateService.getStartOfUserDay(user.timezone || 'UTC');
      const dailyCompletions = await tx.activityLog.count({
        where: {
          userId,
          type: 'TASK_COMPLETED',
          createdAt: { gte: userStartOfDay }
        }
      });

      const integrity = TaskIntegrityService.evaluateIntegrity(task, dailyCompletions);

      // Calculate final rewards with integrity multiplier applied and rounded to nearest 5
      const finalXP = Math.round((task.xpReward * integrity.xpReduction) / 5) * 5;
      const finalCoins = Math.round((task.coinReward * integrity.xpReduction) / 5) * 5;

      // 3. Mark Task as Completed with Optimistic Concurrency Control
      const updateResult = await tx.task.updateMany({
        where: { id: taskId, userId, status: 'PENDING' },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      if (updateResult.count === 0) {
        throw new AppError('TASK_ALREADY_COMPLETED', 'This quest was already completed or not found!', 400);
      }

      const completedTask = await tx.task.findUnique({ where: { id: taskId } });

      // 4. Authoritative Reward Engine: Grant Task Rewards
      const taskRewardResult = await RewardService.grantRewards(userId, tx, {
        xp: finalXP,
        coins: finalCoins,
        primaryAttribute: task.primaryAttribute,
        secondaryAttributes: task.secondaryAttributes,
        difficulty: task.difficulty,
        source: 'TASK_COMPLETED',
        taskId: task.id,
        projectId: task.projectId,
        metadata: {
          integrityReason: integrity.reason
        }
      });

      // 5. Streak Evaluation with User Timezone
      const streakData = StreakService.calculateStreak(
        taskRewardResult.character.currentStreak,
        taskRewardResult.character.longestStreak,
        taskRewardResult.character.lastActiveDate,
        new Date(),
        user.timezone || 'UTC'
      );

      await tx.character.update({
        where: { userId },
        data: {
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          lastActiveDate: streakData.lastActiveDate
        }
      });

      // 6. Handle Project / Quest Progress (Zero-task proof & exactly-once bonus)
      let questCompleted = false;
      let questRewards = null;
      let aggregatedLevelUp = { ...taskRewardResult.levelUp };

      if (task.projectId) {
        const project = await tx.project.findUnique({ where: { id: task.projectId } });
        if (project && project.status !== 'COMPLETED') {
          const projectTasks = await tx.task.findMany({
            where: { projectId: task.projectId }
          });
          const totalTasks = projectTasks.length;
          const completedTasks = projectTasks.filter(t => t.status === 'COMPLETED').length;
          const progress = totalTasks > 0 ? Number((completedTasks / totalTasks).toFixed(2)) : 0;

          // Zero-task quests cannot complete accidentally
          if (totalTasks > 0 && completedTasks === totalTasks) {
            questCompleted = true;
            await tx.project.update({
              where: { id: project.id },
              data: {
                status: 'COMPLETED',
                progress: 1.0,
                completedAt: new Date()
              }
            });

            // Grant Quest Bonus authoritatively via RewardService
            const questRewardResult = await RewardService.grantRewards(userId, tx, {
              xp: project.bonusXP,
              coins: project.bonusCoins,
              primaryAttribute: project.category || 'INTELLECT',
              difficulty: project.difficulty || 'MEDIUM',
              source: 'PROJECT_COMPLETED',
              projectId: project.id
            });

            if (questRewardResult.levelUp.leveledUp) {
              aggregatedLevelUp.leveledUp = true;
              aggregatedLevelUp.newLevel = questRewardResult.levelUp.newLevel;
              aggregatedLevelUp.nextLevelXP = questRewardResult.levelUp.nextLevelXP;
            }

            questRewards = {
              questId: project.id,
              questName: project.name,
              bonusXP: project.bonusXP,
              bonusCoins: project.bonusCoins,
              attribute: project.category,
              attributeGains: questRewardResult.rewardsGranted.attributeGains
            };
          } else {
            await tx.project.update({
              where: { id: project.id },
              data: { progress }
            });
          }
        }
      }

      // 7. Evaluate Achievements
      const latestCharacter = await tx.character.findUnique({ where: { userId } });
      const newlyUnlockedAchievements = await AchievementService.evaluate(
        'TASK_COMPLETED',
        userId,
        tx,
        {
          task: completedTask,
          character: latestCharacter,
          questCompleted,
          streakData,
          completionTime: new Date(),
          timezone: user.timezone || 'UTC'
        }
      );

      // Re-fetch final authoritative character state
      const finalCharacter = await tx.character.findUnique({ where: { userId } });
      if (finalCharacter.level > aggregatedLevelUp.newLevel) {
        aggregatedLevelUp.leveledUp = true;
        aggregatedLevelUp.newLevel = finalCharacter.level;
        aggregatedLevelUp.nextLevelXP = LevelService.getRequiredXP(finalCharacter.level);
      }

      // 8. Return response contract
      const primaryGain = taskRewardResult.rewardsGranted.attributeGains[
        (task.primaryAttribute || '').toLowerCase()
      ] || 0;

      return {
        task: completedTask,
        rewards: {
          xp: finalXP,
          coins: finalCoins,
          attribute: task.primaryAttribute,
          attributeIncrease: primaryGain
        },
        questCompleted,
        questRewards,
        character: {
          level: finalCharacter.level,
          xp: finalCharacter.xp,
          nextLevelXP: aggregatedLevelUp.nextLevelXP,
          coins: finalCharacter.coins,
          intellect: finalCharacter.intellect,
          strength: finalCharacter.strength,
          discipline: finalCharacter.discipline,
          health: finalCharacter.health,
          creativity: finalCharacter.creativity,
          social: finalCharacter.social,
          leadership: finalCharacter.leadership,
          finance: finalCharacter.finance,
          career: finalCharacter.career,
          emotional: finalCharacter.emotional,
          learning: finalCharacter.learning,
          personalGrowth: finalCharacter.personalGrowth
        },
        levelUp: {
          leveledUp: aggregatedLevelUp.leveledUp,
          oldLevel: aggregatedLevelUp.oldLevel,
          newLevel: aggregatedLevelUp.newLevel
        },
        streak: {
          current: finalCharacter.currentStreak,
          longest: finalCharacter.longestStreak,
          streakIncreased: streakData.streakIncreased
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
  }
}

module.exports = TaskCompletionService;
