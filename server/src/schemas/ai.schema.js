const { z } = require('zod');
const { VALIDATION_CONFIG } = require('../config/constants');

const analyzeTaskSchema = z.object({
  title: z.string().min(3).max(VALIDATION_CONFIG.MAX_TASK_TITLE_LENGTH),
  description: z.string().max(VALIDATION_CONFIG.MAX_TASK_DESCRIPTION_LENGTH).optional()
});

const planProjectSchema = z.object({
  goal: z.string().min(3).max(200)
});

const planHabitSchema = z.object({
  habitGoal: z.string().min(3).max(200)
});

const generateQuestAiSchema = z.object({
  goal: z.string().trim().min(3, 'Goal must be at least 3 characters').max(300, 'Goal is too long'),
  category: z.enum([
    'PHYSICAL',
    'INTELLECT',
    'STRENGTH',
    'DISCIPLINE',
    'HEALTH',
    'CREATIVITY',
    'SOCIAL',
    'LEADERSHIP',
    'FINANCE',
    'CAREER',
    'EMOTIONAL',
    'LEARNING',
    'PERSONAL_GROWTH'
  ]).default('INTELLECT'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EPIC']).default('MEDIUM'),
  autoCreate: z.boolean().default(true)
});

module.exports = {
  analyzeTaskSchema,
  planProjectSchema,
  planHabitSchema,
  generateQuestAiSchema
};

