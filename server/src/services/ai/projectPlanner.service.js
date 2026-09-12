const { generateJson } = require('./groq.client');
const FallbackService = require('./fallback.service');
const logger = require('../../errorlogging/logger');
const { z } = require('zod');

const projectPlanSchema = z.object({
  projectName: z.string(),
  phases: z.array(z.object({
    phaseNumber: z.number(),
    title: z.string(),
    tasks: z.array(z.object({
      title: z.string(),
      primaryAttribute: z.enum(["PHYSICAL", "INTELLECT", "STRENGTH", "DISCIPLINE", "HEALTH", "CREATIVITY", "SOCIAL", "LEADERSHIP", "FINANCE", "CAREER", "EMOTIONAL", "LEARNING", "PERSONAL_GROWTH"]).default("DISCIPLINE"),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EPIC"]).default("MEDIUM")
    }))
  }))
});

class ProjectPlannerService {
  /**
   * Decomposes a high-level goal into structured phases and quests.
   *
   * @param {string} goal
   * @returns {Promise<Object>}
   */
  static async planProject(goal) {
    const systemPrompt = `You are a Master Campaign Strategist for a Life RPG.
The user wants to achieve a large goal. Break this down into 3-4 sequential phases, where each phase contains 2-4 actionable tasks.

Respond strictly in JSON matching this schema:
{
  "projectName": "String (Epic title for the campaign)",
  "phases": [
    {
      "phaseNumber": "Integer",
      "title": "String (Phase title)",
      "tasks": [
        {
          "title": "String (Task title)",
          "primaryAttribute": "String (From Category enum)",
          "difficulty": "EASY | MEDIUM | HARD | EPIC"
        }
      ]
    }
  ]
}

Categories: PHYSICAL, INTELLECT, DISCIPLINE, HEALTH, CREATIVITY, SOCIAL, LEADERSHIP, FINANCE, CAREER, EMOTIONAL, LEARNING, PERSONAL_GROWTH.
Do not output markdown code blocks or additional text.`;

    const userMessage = `Goal: ${goal}`;

    try {
      const response = await generateJson([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]);
      const parsed = projectPlanSchema.parse(response);
      return parsed;
    } catch (error) {
      logger.warn('AI Project Planning failed, using deterministic campaign fallback', { error: error.message, goal });
      return FallbackService.planProjectFallback(goal);
    }
  }
}

module.exports = ProjectPlannerService;
