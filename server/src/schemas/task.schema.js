const { z } = require('zod');
const { VALIDATION_CONFIG } = require('../config/constants');

const createTaskSchema = z.object({
  title: z.string().min(3).max(VALIDATION_CONFIG.MAX_TASK_TITLE_LENGTH, `Title must be under ${VALIDATION_CONFIG.MAX_TASK_TITLE_LENGTH} characters.`),
  description: z.string().max(VALIDATION_CONFIG.MAX_TASK_DESCRIPTION_LENGTH).optional(),
  dueDate: z.string().datetime().optional(),
  projectId: z.string().cuid().optional()
});

const updateTaskSchema = z.object({
  title: z.string().min(3).max(VALIDATION_CONFIG.MAX_TASK_TITLE_LENGTH).optional(),
  description: z.string().max(VALIDATION_CONFIG.MAX_TASK_DESCRIPTION_LENGTH).optional(),
  dueDate: z.string().datetime().optional()
});

const taskIdSchema = z.object({
  id: z.string().cuid()
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema
};
