const { z } = require('zod');

const ActivityTypeEnum = z.enum([
  'TASK_CREATED',
  'TASK_COMPLETED',
  'TASK_DELETED',
  'PROJECT_CREATED',
  'PROJECT_COMPLETED',
  'XP_GAINED',
  'LEVEL_UP',
  'ITEM_PURCHASED',
  'ITEM_EQUIPPED',
  'STREAK_STARTED',
  'STREAK_INCREASED',
  'STREAK_BROKEN',
  'STREAK_RECOVERED',
  'ACHIEVEMENT_UNLOCKED',
  'CHALLENGE_CLAIMED'
]);

const listActivityQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1).max(100, 'Limit cannot exceed 100').default(20),
  type: ActivityTypeEnum.optional(),
  startDate: z.string().datetime({ message: 'startDate must be a valid ISO-8601 date string' }).optional(),
  endDate: z.string().datetime({ message: 'endDate must be a valid ISO-8601 date string' }).optional()
});

const recentActivityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50, 'Limit cannot exceed 50').default(10)
});

const activityStatsQuerySchema = z.object({
  period: z.enum(['all', 'today', 'week', 'month']).default('all')
});

module.exports = {
  ActivityTypeEnum,
  listActivityQuerySchema,
  recentActivityQuerySchema,
  activityStatsQuerySchema
};
