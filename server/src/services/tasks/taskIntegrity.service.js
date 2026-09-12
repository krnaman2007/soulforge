const { ANTI_CHEAT } = require('../../config/constants');
const logger = require('../../errorlogging/logger');

class TaskIntegrityService {
  /**
   * Verifies if the task completion is legitimate based on time constraints and suspicion flags.
   *
   * @param {Object} task - The Prisma task object
   * @param {number} dailyCompletions - Number of tasks completed by the user today
   * @returns {Object} { isValid: boolean, xpReduction: number, reason: string }
   */
  static evaluateIntegrity(task, dailyCompletions = 0) {
    try {
      // 1. Time-based Anti-Cheat
      const timeSinceCreationMs = Date.now() - new Date(task.createdAt).getTime();
      if (timeSinceCreationMs < ANTI_CHEAT.MIN_COMPLETION_TIME_MS) {
        return {
          isValid: false,
          xpReduction: 1.0,
          reason: `Task completed too quickly (${timeSinceCreationMs}ms). Minimum time is ${ANTI_CHEAT.MIN_COMPLETION_TIME_MS}ms.`
        };
      }

      // 2. Velocity Anti-Cheat (Spamming completions)
      if (dailyCompletions > ANTI_CHEAT.MAX_DAILY_COMPLETIONS) {
        return {
          isValid: false,
          xpReduction: 1.0,
          reason: `Daily completion limit exceeded (${dailyCompletions}/${ANTI_CHEAT.MAX_DAILY_COMPLETIONS}).`
        };
      }

      // 3. AI Suspicion Flag Reductions
      if (task.suspicion === 'HIGH_RISK') {
        return {
          isValid: true,
          xpReduction: ANTI_CHEAT.HIGH_RISK_REDUCTION, // typically 0 multiplier (0 XP)
          reason: 'Task classified as high-risk spam or prompt injection.'
        };
      }

      if (task.suspicion === 'SUSPICIOUS') {
        return {
          isValid: true,
          xpReduction: ANTI_CHEAT.SUSPICIOUS_EFFORT_REDUCTION, // typically 0.5 multiplier (Half XP)
          reason: 'Task classified as suspicious. Rewards reduced.'
        };
      }

      return {
        isValid: true,
        xpReduction: 1.0, // Full multiplier
        reason: 'Valid'
      };
    } catch (error) {
      logger.error('Error in TaskIntegrityService', { error, taskId: task.id });
      // In case of error, assume valid to prevent blocking legitimate players
      return { isValid: true, xpReduction: 1.0, reason: 'Error evaluating integrity' };
    }
  }
}

module.exports = TaskIntegrityService;
