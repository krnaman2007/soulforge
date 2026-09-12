const prisma = require('../../db/prisma');
const ProjectPlannerService = require('./projectPlanner.service');
const RewardService = require('../rpg/reward.service');
const { RPG_CONSTANTS } = require('../../config/constants');
const QuestService = require('../quests/quest.service');
const logger = require('../../errorlogging/logger');

class AiQuestGeneratorService {
  static buildBlueprint(rawPlan, { goal, category, difficulty }) {
    const questRewards = RPG_CONSTANTS.QUEST_DIFFICULTY_REWARDS[difficulty] || RPG_CONSTANTS.QUEST_DIFFICULTY_REWARDS.MEDIUM;
    const taskBlueprints = [];

    for (const phase of Array.isArray(rawPlan.phases) ? rawPlan.phases : []) {
      for (const task of Array.isArray(phase.tasks) ? phase.tasks : []) {
        const taskDifficulty = task.difficulty || difficulty;
        const taskCategory = task.primaryAttribute || category;
        const reward = RewardService.calculateTaskReward({ difficulty: taskDifficulty, effort: 'MEDIUM', impact: 'MEDIUM', priority: 'MEDIUM' });
        taskBlueprints.push({
          title: task.title,
          description: `Phase ${phase.phaseNumber}: ${phase.title}`,
          primaryAttribute: taskCategory,
          difficulty: taskDifficulty,
          xpReward: reward.xp,
          coinReward: reward.coins,
          aiAnalyzed: true,
          aiConfidence: 0.95
        });
      }
    }

    return {
      questName: (rawPlan.projectName || goal).substring(0, 100),
      goal,
      category,
      difficulty,
      bonusXP: questRewards.xp,
      bonusCoins: questRewards.coins,
      phases: rawPlan.phases || [],
      tasks: taskBlueprints
    };
  }

  static async generateQuest(userId, { goal, category = 'INTELLECT', difficulty = 'MEDIUM', autoCreate = false }) {
    const rawPlan = await ProjectPlannerService.planProject(goal);
    const plan = this.buildBlueprint(rawPlan, { goal, category, difficulty });
    if (!autoCreate) return plan;
    return this.createQuest(userId, plan);
  }

  static async createQuest(userId, plan) {
    if (!plan || !plan.questName || !Array.isArray(plan.tasks)) {
      throw new Error('Invalid AI quest plan');
    }

    const difficulty = plan.difficulty || 'MEDIUM';
    const questRewards = RPG_CONSTANTS.QUEST_DIFFICULTY_REWARDS[difficulty] || RPG_CONSTANTS.QUEST_DIFFICULTY_REWARDS.MEDIUM;
    const bonusXP = plan.bonusXP ?? questRewards.xp;
    const bonusCoins = plan.bonusCoins ?? questRewards.coins;

    try {
      const createdQuest = await prisma.$transaction(async (tx) => {
        const quest = await tx.project.create({
          data: {
            userId,
            name: plan.questName,
            description: `Campaign Goal: ${plan.goal || plan.questName}`,
            category: plan.category || 'INTELLECT',
            difficulty,
            type: 'PROJECT',
            status: 'ACTIVE',
            progress: 0,
            bonusXP,
            bonusCoins
          }
        });

        for (const tb of plan.tasks) {
          await tx.task.create({
            data: {
              userId,
              projectId: quest.id,
              questType: 'PROJECT',
              title: tb.title,
              description: tb.description || null,
              primaryAttribute: tb.primaryAttribute || plan.category || 'INTELLECT',
              difficulty: tb.difficulty || plan.difficulty || 'MEDIUM',
              xpReward: RewardService.calculateTaskReward({
                difficulty: tb.difficulty || plan.difficulty || 'MEDIUM',
                effort: 'MEDIUM',
                impact: 'MEDIUM',
                priority: 'MEDIUM'
              }).xp,
              coinReward: RewardService.calculateTaskReward({
                difficulty: tb.difficulty || plan.difficulty || 'MEDIUM',
                effort: 'MEDIUM',
                impact: 'MEDIUM',
                priority: 'MEDIUM'
              }).coins,
              status: 'PENDING',
              aiAnalyzed: true,
              aiConfidence: tb.aiConfidence ?? 0.95
            }
          });
        }

        await tx.activityLog.create({
          data: {
            userId,
            type: 'PROJECT_CREATED',
            projectId: quest.id,
            metadata: { aiGenerated: true, goal: plan.goal || null, taskCount: plan.tasks.length, bonusXP: plan.bonusXP || 0, bonusCoins: plan.bonusCoins || 0 }
          }
        });

        return tx.project.findUnique({ where: { id: quest.id }, include: { tasks: true } });
      }, { timeout: 15000, maxWait: 10000 });

      return QuestService.formatQuest(createdQuest);
    } catch (error) {
      logger.error('Failed to atomically persist AI generated quest', { error: error.message, userId, goal: plan.goal });
      throw error;
    }
  }
}

module.exports = AiQuestGeneratorService;
