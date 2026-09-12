const prisma = require('../../db/prisma');
const TaskAnalyzerService = require('../ai/taskAnalyzer.service');
const logger = require('../../errorlogging/logger');
const { AppError } = require('../../utils/errors');
const RewardService = require('../rpg/reward.service');

class TaskService {
  /**
   * Retrieves tasks for a user, with optional filters.
   */
  static async getTasks(userId, query = {}) {
    const where = { userId };
    
    if (query.status) where.status = query.status;
    if (query.projectId) where.projectId = query.projectId;
    if (query.primaryAttribute) where.primaryAttribute = query.primaryAttribute;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    return tasks;
  }

  /**
   * Creates a new task and analyzes it using the AI Subsystem.
   */
  static async createTask(userId, data) {
    const { title, description, projectId, dueDate } = data;

    // 0. Verify Project Ownership if projectId is provided
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId }
      });
      if (!project) {
        throw new AppError('Project not found or access denied', 403, 'FORBIDDEN');
      }
    }

    // 1. Send to AI for semantic classification
    const aiAnalysis = await TaskAnalyzerService.analyzeTask(title, description);

    // 2. Deterministically calculate rewards based on AI classification
    const rewards = RewardService.calculateTaskReward({
      difficulty: aiAnalysis.difficulty,
      effort: aiAnalysis.effort,
      impact: aiAnalysis.impact,
      priority: aiAnalysis.priority
    });

    // 3. Persist to DB
    const task = await prisma.task.create({
      data: {
        userId,
        projectId,
        questType: projectId ? 'PROJECT' : null,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        
        primaryAttribute: aiAnalysis.primaryAttribute,
        secondaryAttributes: aiAnalysis.secondaryAttributes || [],
        priority: aiAnalysis.priority,
        difficulty: aiAnalysis.difficulty,
        effort: aiAnalysis.effort,
        impact: aiAnalysis.impact,
        
        suspicion: aiAnalysis.suspicion,
        aiAnalyzed: true,
        aiConfidence: aiAnalysis.confidence,
        aiFlagged: aiAnalysis.suspicion === 'SUSPICIOUS' || aiAnalysis.suspicion === 'HIGH_RISK',
        
        xpReward: rewards.xp,
        coinReward: rewards.coins,
        status: 'PENDING'
      }
    });

    logger.info(`Task created for user ${userId}`, { taskId: task.id, title, rewards });
    return task;
  }

  /**
   * Updates an existing task. (Title, description, dueDate only)
   * Enforces immutability of reward, difficulty, and attribute fields.
   */
  static async updateTask(userId, taskId, data) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!task) {
      throw new AppError('TASK_NOT_FOUND', 'Task not found', 404);
    }

    if (task.status === 'COMPLETED') {
      throw new AppError('TASK_ALREADY_COMPLETED', 'Cannot edit a completed task', 400);
    }

    // Whitelist only safe mutable fields to prevent reward or status tampering
    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    await prisma.task.updateMany({
      where: { id: taskId, userId },
      data: updateData
    });

    return await prisma.task.findFirst({
      where: { id: taskId, userId }
    });
  }

  /**
   * Deletes a task strictly scoped to the authenticated user.
   */
  static async deleteTask(userId, taskId) {
    const result = await prisma.task.deleteMany({
      where: { id: taskId, userId }
    });

    if (result.count === 0) {
      throw new AppError('TASK_NOT_FOUND', 'Task not found', 404);
    }

    logger.info(`Task deleted by user ${userId}`, { taskId });
    return { success: true };
  }
}

module.exports = TaskService;
