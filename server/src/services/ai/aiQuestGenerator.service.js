const prisma = require('../../db/prisma');
const ProjectPlannerService = require('./projectPlanner.service');
const RewardService = require('../rpg/reward.service');
const { RPG_CONSTANTS } = require('../../config/constants');
const QuestService = require('../quests/quest.service');
const logger = require('../../errorlogging/logger');

class AiQuestGeneratorService {
  /**
   * Generates a Quest campaign from a high-level goal using AI,
   * calculates authoritative rewards, and optionally persists quest + tasks in an ACID transaction.
   *
   * @param {string} userId
   * @param {Object} params
   * @param {string} params.goal - High-level goal description
   * @param {string} [params.category] - Life RPG Category
   * @param {string} [params.difficulty] - EASY | MEDIUM | HARD | EPIC
   * @param {boolean} [params.autoCreate=true] - Whether to save to DB immediately
   */
  static async generateQuest(userId, { goal, category = 'INTELLECT', difficulty = 'MEDIUM', autoCreate = true }) {
    const rawPlan = await ProjectPlannerService.planProject(goal);

    const questRewards = RPG_CONSTANTS.QUEST_DIFFICULTY_REWARDS[difficulty] || RPG_CONSTANTS.QUEST_DIFFICULTY_REWARDS.MEDIUM;

    // Flatten phases into an ordered list of tasks with authoritative rewards
    const taskBlueprints = [];
    if (rawPlan.phases && Array.isArray(rawPlan.phases)) {
      for (const phase of rawPlan.phases) {
        if (phase.tasks && Array.isArray(phase.tasks)) {
          for (const task of phase.tasks) {
            const taskDifficulty = task.difficulty || difficulty || 'MEDIUM';
            const taskCategory = task.primaryAttribute || category || 'INTELLECT';
            const reward = RewardService.calculateTaskReward({
              difficulty: taskDifficulty,
              effort: 'MEDIUM',
              impact: 'MEDIUM',
              priority: 'MEDIUM'
            });

            taskBlueprints.push({
              title: task.title,
              description: `Phase ${phase.phaseNumber}: ${phase.title}`,
              primaryAttribute: taskCategory,
              difficulty: taskDifficulty,
              xpReward: reward.xp,
              coinReward: reward.coins
            });
          }
        }
      }
    }

    if (!autoCreate) {
      return {
        questName: rawPlan.projectName,
        goal,
        category,
        difficulty,
        bonusXP: questRewards.xp,
        bonusCoins: questRewards.coins,
        phases: rawPlan.phases,
        tasks: taskBlueprints
      };
    }

    // Persist quest and child tasks atomically
    try {
      const createdQuest = await prisma.$transaction(async (tx) => {
        const quest = await tx.project.create({
          data: {
            userId,
            name: rawPlan.projectName || goal,
            description: `Campaign Goal: ${goal}`,
            category,
            difficulty,
            type: 'PROJECT',
            status: 'ACTIVE',
            progress: 0.0,
            bonusXP: questRewards.xp,
            bonusCoins: questRewards.coins
          }
        });

        for (const tb of taskBlueprints) {
          await tx.task.create({
            data: {
              userId,
              projectId: quest.id,
              title: tb.title,
              description: tb.description,
              primaryAttribute: tb.primaryAttribute,
              difficulty: tb.difficulty,
              xpReward: tb.xpReward,
              coinReward: tb.coinReward,
              status: 'PENDING',
              aiAnalyzed: true,
              aiConfidence: 0.95
            }
          });
        }

        await tx.activityLog.create({
          data: {
            userId,
            type: 'PROJECT_CREATED',
            projectId: quest.id,
            metadata: {
              aiGenerated: true,
              goal,
              taskCount: taskBlueprints.length,
              bonusXP: questRewards.xp,
              bonusCoins: questRewards.coins
            }
          }
        });

        return await tx.project.findUnique({
          where: { id: quest.id },
          include: {
            tasks: true
          }
        });
      }, { timeout: 15000, maxWait: 10000 });

      return QuestService.formatQuest(createdQuest);
    } catch (error) {
      logger.error('Failed to atomically persist AI generated quest', { error: error.message, userId, goal });
      throw error;
    }
  }
}

module.exports = AiQuestGeneratorService;
