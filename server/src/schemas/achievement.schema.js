const { z } = require('zod');

const AchievementTypeEnum = z.enum([
  'TASK',
  'STREAK',
  'LEVEL',
  'PROJECT',
  'ECONOMY',
  'CHALLENGE'
]);

const listAchievementsQuerySchema = z.object({
  type: AchievementTypeEnum.optional()
});

const achievementIdParamSchema = z.object({
  id: z.string().trim().min(1, 'Achievement ID is required')
});

module.exports = {
  AchievementTypeEnum,
  listAchievementsQuerySchema,
  achievementIdParamSchema
};
