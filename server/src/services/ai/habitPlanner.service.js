const { generateJson } = require('./gemini.client');
const FallbackService = require('./fallback.service');
const logger = require('../../errorlogging/logger');
const { z } = require('zod');

const habitPlanSchema = z.object({
  campaignName: z.string(),
  days: z.array(z.object({
    dayNumber: z.number(),
    title: z.string(),
    primaryAttribute: z.enum(["PHYSICAL", "INTELLECT", "STRENGTH", "DISCIPLINE", "HEALTH", "CREATIVITY", "SOCIAL", "LEADERSHIP", "FINANCE", "CAREER", "EMOTIONAL", "LEARNING", "PERSONAL_GROWTH"]).default("DISCIPLINE"),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM")
  }))
});

class HabitPlannerService {
  /**
   * Deconstructs a vague habit intention into a 7-day micro-quest chain.
   *
   * @param {string} habitGoal
   * @returns {Promise<Object>}
   */
  static async planHabit(habitGoal) {
    const systemPrompt = `You are a Habit Architect for a Life RPG.
The user wants to build a new habit or break a bad one. Create a progressive 7-day quest chain (1 task per day).
Start ridiculously small on Day 1, and gradually increase difficulty to Day 7.

Respond strictly in JSON matching this schema:
{
  "campaignName": "String (Name of the 7-day habit campaign)",
  "days": [
    {
      "dayNumber": "Integer (1-7)",
      "title": "String (Task title)",
      "primaryAttribute": "String (From Category enum)",
      "difficulty": "EASY | MEDIUM | HARD"
    }
  ]
}

Categories: PHYSICAL, INTELLECT, DISCIPLINE, HEALTH, CREATIVITY, SOCIAL, LEADERSHIP, FINANCE, CAREER, EMOTIONAL, LEARNING, PERSONAL_GROWTH.
Do not output markdown code blocks or additional text.`;

    const userMessage = `Habit Goal: ${habitGoal}`;

    try {
      const response = await generateJson([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]);
      const parsed = habitPlanSchema.parse(response);
      return parsed;
    } catch (error) {
      logger.warn('AI Habit Planning failed, using deterministic habit fallback', { error: error.message, habitGoal });
      return FallbackService.planHabitFallback(habitGoal);
    }
  }
}

module.exports = HabitPlannerService;
