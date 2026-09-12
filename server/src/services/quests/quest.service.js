const prisma = require('../../db/prisma');
const { AppError } = require('../../utils/errors');
const { RPG_CONSTANTS } = require('../../config/constants');
const logger = require('../../errorlogging/logger');

class QuestService {
  /**
   * Helper to format quest with task analytics
   */
  static formatQuest(quest) {
    const tasks = quest.tasks || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const progress = totalTasks > 0 ? Number((completedTasks / totalTasks).toFixed(2)) : quest.progress;

    return {
      id: quest.id,
      userId: quest.userId,
      name: quest.name,
      description: quest.description,
      category: quest.category,
      difficulty: quest.difficulty,
      type: quest.type,
      status: quest.status,
      progress,
      totalTasks,
      completedTasks,
      bonusXP: quest.bonusXP,
      bonusCoins: quest.bonusCoins,
      completedAt: quest.completedAt,
      createdAt: quest.createdAt,
      updatedAt: quest.updatedAt,
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        difficulty: t.difficulty,
        xpReward: t.xpReward,
        coinReward: t.coinReward,
        completedAt: t.completedAt
      }))
    };
  }

  /**
   * Create a new Quest (backed by Project)
   */
  static async createQuest(userId, data) {
    const { name, description, category = 'INTELLECT', difficulty = 'MEDIUM', type = 'PROJECT' } = data;

    const rewards = RPG_CONSTANTS.QUEST_DIFFICULTY_REWARDS[difficulty] || RPG_CONSTANTS.QUEST_DIFFICULTY_REWARDS.MEDIUM;

    try {
      const quest = await prisma.$transaction(async (tx) => {
        const created = await tx.project.create({
          data: {
            userId,
            name,
            description,
            category,
            difficulty,
            type,
            bonusXP: rewards.xp,
            bonusCoins: rewards.coins,
            status: 'ACTIVE',
            progress: 0.0
          },
          include: {
            tasks: true
          }
        });

        await tx.activityLog.create({
          data: {
            userId,
            type: 'PROJECT_CREATED',
            projectId: created.id,
            metadata: {
              questName: name,
              category,
              difficulty,
              type,
              bonusXP: rewards.xp,
              bonusCoins: rewards.coins
            }
          }
        });

        return created;
      });

      return this.formatQuest(quest);
    } catch (error) {
      logger.error('Error creating quest', { error, userId, data });
      throw error;
    }
  }

  /**
   * List quests with filters and pagination
   */
  static async listQuests(userId, query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(query.status && { status: query.status }),
      ...(query.category && { category: query.category }),
      ...(query.difficulty && { difficulty: query.difficulty }),
      ...(query.type && { type: query.type })
    };

    const [total, quests] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        include: {
          tasks: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              difficulty: true,
              xpReward: true,
              coinReward: true,
              completedAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      quests: quests.map(q => this.formatQuest(q)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Get single quest details
   */
  static async getQuestById(userId, questId) {
    const quest = await prisma.project.findUnique({
      where: { id: questId },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            difficulty: true,
            xpReward: true,
            coinReward: true,
            completedAt: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!quest || quest.userId !== userId) {
      throw new AppError('QUEST_NOT_FOUND', 'Quest not found', 404);
    }

    return this.formatQuest(quest);
  }

  /**
   * Get quest progress analytics
   */
  static async getQuestProgress(userId, questId) {
    const quest = await this.getQuestById(userId, questId);
    return {
      id: quest.id,
      name: quest.name,
      category: quest.category,
      difficulty: quest.difficulty,
      type: quest.type,
      status: quest.status,
      progress: quest.progress,
      totalTasks: quest.totalTasks,
      completedTasks: quest.completedTasks,
      bonusRewards: {
        xp: quest.bonusXP,
        coins: quest.bonusCoins,
        attribute: quest.category
      },
      tasks: quest.tasks
    };
  }

  /**
   * Update quest
   */
  static async updateQuest(userId, questId, data) {
    const existing = await prisma.project.findUnique({
      where: { id: questId }
    });

    if (!existing || existing.userId !== userId) {
      throw new AppError('QUEST_NOT_FOUND', 'Quest not found', 404);
    }

    const updateData = { ...data };

    // If difficulty is modified, authoritatively recalculate bonus rewards (only if no child tasks completed)
    if (data.difficulty && data.difficulty !== existing.difficulty) {
      const completedTaskCount = await prisma.task.count({
        where: { projectId: questId, status: 'COMPLETED' }
      });
      if (completedTaskCount > 0) {
        throw new AppError('QUEST_DIFFICULTY_LOCKED', 'Cannot change quest difficulty once tasks have been completed', 400);
      }
      const rewards = RPG_CONSTANTS.QUEST_DIFFICULTY_REWARDS[data.difficulty] || RPG_CONSTANTS.QUEST_DIFFICULTY_REWARDS.MEDIUM;
      updateData.bonusXP = rewards.xp;
      updateData.bonusCoins = rewards.coins;
    }

    const updated = await prisma.project.update({
      where: { id: questId },
      data: updateData,
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            difficulty: true,
            xpReward: true,
            coinReward: true,
            completedAt: true
          }
        }
      }
    });

    return this.formatQuest(updated);
  }

  /**
   * Delete quest strictly scoped to authenticated user
   */
  static async deleteQuest(userId, questId) {
    const result = await prisma.project.deleteMany({
      where: { id: questId, userId }
    });

    if (result.count === 0) {
      throw new AppError('QUEST_NOT_FOUND', 'Quest not found', 404);
    }

    return {
      message: 'Quest deleted successfully',
      questId
    };
  }
}

module.exports = QuestService;
