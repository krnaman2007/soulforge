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
  autoCreate: z.boolean().default(false)
});

const createQuestAiSchema = z.object({
  questName: z.string().trim().min(3).max(100),
  goal: z.string().trim().min(3).max(300),
  category: z.enum(['PHYSICAL','INTELLECT','STRENGTH','DISCIPLINE','HEALTH','CREATIVITY','SOCIAL','LEADERSHIP','FINANCE','CAREER','EMOTIONAL','LEARNING','PERSONAL_GROWTH']),
  difficulty: z.enum(['EASY','MEDIUM','HARD','EPIC']),
  bonusXP: z.number().int().nonnegative(),
  bonusCoins: z.number().int().nonnegative(),
  phases: z.array(z.any()).default([]),
  tasks: z.array(z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().max(1000).optional(),
    primaryAttribute: z.enum(['PHYSICAL','INTELLECT','STRENGTH','DISCIPLINE','HEALTH','CREATIVITY','SOCIAL','LEADERSHIP','FINANCE','CAREER','EMOTIONAL','LEARNING','PERSONAL_GROWTH']).optional(),
    difficulty: z.enum(['EASY','MEDIUM','HARD','EPIC']).optional(),
    xpReward: z.number().int().nonnegative(),
    coinReward: z.number().int().nonnegative(),
    aiAnalyzed: z.boolean().optional(),
    aiConfidence: z.number().min(0).max(1).optional()
  })).max(200)
});

module.exports = {
  analyzeTaskSchema,
  planProjectSchema,
  planHabitSchema,
  generateQuestAiSchema,
  createQuestAiSchema
};

