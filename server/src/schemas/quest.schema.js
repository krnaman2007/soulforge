const { z } = require('zod');
const { VALIDATION_CONFIG } = require('../config/constants');

const CategoryEnum = z.enum([
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
]);

const DifficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD', 'EPIC']);

const QuestTypeEnum = z.enum([
  'ONE_TIME',
  'DAILY',
  'RECURRING',
  'MILESTONE',
  'HABIT',
  'PROJECT',
  'LEARNING',
  'CHALLENGE'
]);

const ProjectStatusEnum = z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED']);

const createQuestSchema = z.object({
  name: z.string().trim().min(3, 'Quest name must be at least 3 characters').max(VALIDATION_CONFIG.MAX_PROJECT_NAME_LENGTH || 100, 'Quest name is too long'),
  description: z.string().trim().max(1000).optional(),
  category: CategoryEnum.default('INTELLECT'),
  difficulty: DifficultyEnum.default('MEDIUM'),
  type: QuestTypeEnum.default('PROJECT')
});

const updateQuestSchema = z.object({
  name: z.string().trim().min(3).max(100).optional(),
  description: z.string().trim().max(1000).optional(),
  category: CategoryEnum.optional(),
  difficulty: DifficultyEnum.optional(),
  type: QuestTypeEnum.optional(),
  status: ProjectStatusEnum.optional()
});

const questIdParamSchema = z.object({
  id: z.string().trim().min(1, 'Quest ID is required')
});

const listQuestsQuerySchema = z.object({
  status: ProjectStatusEnum.optional(),
  category: CategoryEnum.optional(),
  difficulty: DifficultyEnum.optional(),
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50').default(20)
});

module.exports = {
  CategoryEnum,
  DifficultyEnum,
  QuestTypeEnum,
  ProjectStatusEnum,
  createQuestSchema,
  updateQuestSchema,
  questIdParamSchema,
  listQuestsQuerySchema
};
