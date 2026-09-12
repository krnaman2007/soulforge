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

module.exports = {
  analyzeTaskSchema,
  planProjectSchema,
  planHabitSchema
};
