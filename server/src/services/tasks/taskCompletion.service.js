const prisma = require('../../db/prisma');
const TaskIntegrityService = require('./taskIntegrity.service');
const LevelService = require('../rpg/level.service');
const AttributeService = require('../rpg/attribute.service');
const StreakService = require('../rpg/streak.service');
const logger = require('../../errorlogging/logger');
const { AppError } = require('../../utils/errors');

class TaskCompletionService {
  /**
   * Completes a task, applying anti-cheat verification, and grants authoritative rewards.
   * Runs entirely inside a Prisma Transaction to guarantee ACID compliance.
   */
  static async completeTask(userId, taskId) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch Task and User's Character
      const task = await tx.task.findFirst({
        where: { id: taskId, userId }
      });

      if (!task) {
        throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
      }
      if (task.status === 'COMPLETED') {
        throw new AppError('This quest was already completed!', 400, 'TASK_ALREADY_COMPLETED');
      }

      const character = await tx.character.findUnique({
        where: { userId }
      });

      if (!character) {
        throw new AppError('Character not found', 404, 'CHARACTER_NOT_FOUND');
      }

      // 2. Anti-Cheat Verification
      // For a real production app, we would query the count of daily completions.
      // Here we pass 0 for simplicity, but could count ActivityLogs for today.
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      
      const dailyCompletions = await tx.activityLog.count({
        where: {
          userId,
          type: 'TASK_COMPLETED',
          createdAt: { gte: todayStart }
        }
      });

      const integrity = TaskIntegrityService.evaluateIntegrity(task, dailyCompletions);
      
      // Calculate final rewards with integrity multiplier applied and rounded to nearest 5
      const finalXP = Math.round((task.xpReward * integrity.xpReduction) / 5) * 5;
      const finalCoins = Math.round((task.coinReward * integrity.xpReduction) / 5) * 5;

      // 3. Mark Task as Completed (Optimistic Concurrency Control)
      const updateResult = await tx.task.updateMany({
        where: { id: taskId, status: 'PENDING' },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      if (updateResult.count === 0) {
        throw new AppError('This quest was already completed or not found!', 400, 'TASK_ALREADY_COMPLETED');
      }

      // Re-fetch the updated task for returning to client
      const completedTask = await tx.task.findUnique({ where: { id: taskId } });

      // 4. Calculate New Level & XP
      const levelUpData = LevelService.applyXP(character.level, character.xp, finalXP);

      // 5. Calculate Attribute Gains
      const attributeGains = AttributeService.calculateAttributeGains({
        primaryAttribute: task.primaryAttribute,
        secondaryAttributes: task.secondaryAttributes,
        difficulty: task.difficulty
      });

      // Prepare attribute updates for Prisma
      const characterUpdateData = {
        level: levelUpData.newLevel,
        xp: levelUpData.remainingXP,
        coins: { increment: finalCoins }
      };

      for (const [attr, gain] of Object.entries(attributeGains)) {
        characterUpdateData[attr] = { increment: gain };
      }

      // 6. Streak Evaluation
      const streakData = StreakService.calculateStreak(
        character.currentStreak,
        character.longestStreak,
        character.lastActiveDate,
        new Date()
      );

      characterUpdateData.currentStreak = streakData.currentStreak;
      characterUpdateData.longestStreak = streakData.longestStreak;
      characterUpdateData.lastActiveDate = streakData.lastActiveDate;

      // Apply Character Update
      const updatedCharacter = await tx.character.update({
        where: { userId },
        data: characterUpdateData
      });

      // 7. Activity Logging
      await tx.activityLog.create({
        data: {
          userId,
          type: 'TASK_COMPLETED',
          taskId: task.id,
          projectId: task.projectId,
          xpChange: finalXP,
          coinChange: finalCoins,
          metadata: {
            integrityReason: integrity.reason,
            levelUp: levelUpData.leveledUp,
            attributeGains
          }
        }
      });

      // 8. Handle Project / Quest Progress (if part of a project)
      let questCompleted = false;
      let questRewards = null;
      let finalCharacter = updatedCharacter;
      let finalLevelUp = {
        leveledUp: levelUpData.leveledUp,
        oldLevel: levelUpData.oldLevel,
        newLevel: levelUpData.newLevel,
        nextLevelXP: levelUpData.nextLevelXP
      };

      if (task.projectId) {
        const projectTasks = await tx.task.findMany({
          where: { projectId: task.projectId }
        });
        const completedCount = projectTasks.filter(t => t.status === 'COMPLETED').length;
        const progress = projectTasks.length > 0 ? completedCount / projectTasks.length : 1.0;

        const projectUpdate = { progress };
        
        // If Project Completed
        if (completedCount === projectTasks.length) {
          projectUpdate.status = 'COMPLETED';
          projectUpdate.completedAt = new Date();
          
          const project = await tx.project.findUnique({ where: { id: task.projectId } });
          if (project && project.status !== 'COMPLETED') {
            questCompleted = true;

            // Calculate quest attribute gains based on category & difficulty
            const questAttrGains = AttributeService.calculateAttributeGains({
              primaryAttribute: project.category || 'INTELLECT',
              difficulty: project.difficulty || 'MEDIUM'
            });

            // Route quest bonus XP through authoritative LevelService.applyXP
            const questLevelData = LevelService.applyXP(
              finalCharacter.level,
              finalCharacter.xp,
              project.bonusXP
            );

            const questCharUpdate = {
              level: questLevelData.newLevel,
              xp: questLevelData.remainingXP,
              coins: { increment: project.bonusCoins }
            };

            for (const [attr, gain] of Object.entries(questAttrGains)) {
              questCharUpdate[attr] = { increment: gain };
            }

            finalCharacter = await tx.character.update({
              where: { userId },
              data: questCharUpdate
            });

            finalLevelUp = {
              leveledUp: levelUpData.leveledUp || questLevelData.leveledUp,
              oldLevel: levelUpData.oldLevel,
              newLevel: questLevelData.newLevel,
              nextLevelXP: questLevelData.nextLevelXP
            };

            questRewards = {
              questId: project.id,
              questName: project.name,
              bonusXP: project.bonusXP,
              bonusCoins: project.bonusCoins,
              attribute: project.category,
              attributeGains: questAttrGains
            };

            await tx.activityLog.create({
              data: {
                userId,
                type: 'PROJECT_COMPLETED',
                projectId: project.id,
                xpChange: project.bonusXP,
                coinChange: project.bonusCoins,
                metadata: {
                  levelUp: questLevelData.leveledUp,
                  newLevel: questLevelData.newLevel,
                  attributeGains: questAttrGains
                }
              }
            });
          }
        }
        
        await tx.project.update({
          where: { id: task.projectId },
          data: projectUpdate
        });
      }

      // 9. Format response payload to match frontend contract
      return {
        task: completedTask,
        rewards: {
          xp: finalXP,
          coins: finalCoins,
          attribute: task.primaryAttribute,
          attributeIncrease: attributeGains[AttributeService.calculateAttributeGains({ primaryAttribute: task.primaryAttribute, difficulty: task.difficulty }) ? Object.keys(AttributeService.calculateAttributeGains({ primaryAttribute: task.primaryAttribute, difficulty: task.difficulty }))[0] : ''] || 0
        },
        questCompleted,
        questRewards,
        character: {
          level: finalCharacter.level,
          xp: finalCharacter.xp,
          nextLevelXP: finalLevelUp.nextLevelXP,
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
          leveledUp: finalLevelUp.leveledUp,
          oldLevel: finalLevelUp.oldLevel,
          newLevel: finalLevelUp.newLevel
        },
        streak: {
          current: finalCharacter.currentStreak,
          longest: finalCharacter.longestStreak,
          streakIncreased: streakData.streakIncreased
        },
        achievementsUnlocked: []
      };
    });
  }
}

module.exports = TaskCompletionService;
